.PHONY: help build build-dev build-image push-image package install uninstall upgrade test lint format clean \
        helm-package helm-lint helm-publish validate-release release pre-release-check \
        update-metrics regenerate-yarn-lock start dev i18n \
        verify-image verify-helm-repo

# Configuration
REGISTRY ?= quay.io/edge-infrastructure
IMAGE_NAME ?= console-plugin-nvidia-gpu
VERSION ?= $(shell grep '^version:' deployment/console-plugin-nvidia-gpu/Chart.yaml | awk '{print $$2}')
TAG ?= $(shell git rev-parse --short HEAD)
HELM_REPO_URL ?= https://rh-ecosystem-edge.github.io/console-plugin-nvidia-gpu
NAMESPACE ?= nvidia-gpu-operator
RELEASE_NAME ?= console-plugin-nvidia-gpu

# Container tool (podman or docker)
CONTAINER_TOOL ?= $(shell command -v podman 2>/dev/null || echo docker)

# Colors for output
BLUE := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RESET := \033[0m

help: ## Show this help
	@echo "$(BLUE)Available targets:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(BLUE)%-25s$(RESET) %s\n", $$1, $$2}'

##@ Development

build: ## Build the plugin for production
	@echo "$(GREEN)Building plugin for production...$(RESET)"
	yarn build

build-dev: ## Build the plugin for development
	@echo "$(GREEN)Building plugin for development...$(RESET)"
	yarn build-dev

start: ## Start the development server
	@echo "$(GREEN)Starting development server...$(RESET)"
	yarn start

dev: start ## Alias for start

i18n: ## Generate i18n translations
	@echo "$(GREEN)Generating i18n translations...$(RESET)"
	yarn i18n

test: ## Run tests
	@echo "$(GREEN)Running tests...$(RESET)"
	yarn test

lint: ## Lint the code
	@echo "$(GREEN)Linting code...$(RESET)"
	yarn lint

format: ## Format the code with prettier
	@echo "$(GREEN)Formatting code...$(RESET)"
	yarn prettier

clean: ## Clean build artifacts
	@echo "$(GREEN)Cleaning build artifacts...$(RESET)"
	yarn clean
	rm -rf dist/ *.tgz

regenerate-yarn-lock: ## Regenerate yarn.lock using Node.js 18 container
	@echo "$(GREEN)Regenerating yarn.lock using Node.js 18 container...$(RESET)"
	@$(CONTAINER_TOOL) run --rm \
		-v "$(CURDIR):/workspace:z" \
		-w /workspace \
		--user root \
		registry.access.redhat.com/ubi9/nodejs-18:latest \
		bash -c "command -v yarn || npm i -g yarn && rm -f yarn.lock && yarn install --ignore-engines && chown $(shell id -u):$(shell id -g) yarn.lock"
	@echo "$(GREEN)✓ yarn.lock regenerated successfully!$(RESET)"

##@ Container Image

build-image: ## Build container image with commit hash tag
	@echo "$(GREEN)Building image: $(REGISTRY)/$(IMAGE_NAME):$(TAG)$(RESET)"
	$(CONTAINER_TOOL) build -t $(REGISTRY)/$(IMAGE_NAME):$(TAG) .

build-image-versioned: ## Build container image with version tag
	@echo "$(GREEN)Building image: $(REGISTRY)/$(IMAGE_NAME):$(VERSION)$(RESET)"
	$(CONTAINER_TOOL) build -t $(REGISTRY)/$(IMAGE_NAME):$(VERSION) .
	$(CONTAINER_TOOL) tag $(REGISTRY)/$(IMAGE_NAME):$(VERSION) $(REGISTRY)/$(IMAGE_NAME):latest

push-image: build-image ## Build and push container image with commit hash tag
	@echo "$(GREEN)Pushing image: $(REGISTRY)/$(IMAGE_NAME):$(TAG)$(RESET)"
	$(CONTAINER_TOOL) push $(REGISTRY)/$(IMAGE_NAME):$(TAG)
	@echo "$(GREEN)✓ Successfully pushed: $(REGISTRY)/$(IMAGE_NAME):$(TAG)$(RESET)"

push-image-versioned: build-image-versioned ## Build and push container image with version and latest tags
	@echo "$(GREEN)Pushing image: $(REGISTRY)/$(IMAGE_NAME):$(VERSION)$(RESET)"
	$(CONTAINER_TOOL) push $(REGISTRY)/$(IMAGE_NAME):$(VERSION)
	@echo "$(GREEN)Pushing image: $(REGISTRY)/$(IMAGE_NAME):latest$(RESET)"
	$(CONTAINER_TOOL) push $(REGISTRY)/$(IMAGE_NAME):latest
	@echo "$(GREEN)✓ Successfully pushed: $(REGISTRY)/$(IMAGE_NAME):$(VERSION) and latest$(RESET)"

verify-image: ## Verify that the versioned image exists in the registry
	@echo "$(GREEN)Verifying image: $(REGISTRY)/$(IMAGE_NAME):$(VERSION)$(RESET)"
	$(CONTAINER_TOOL) pull $(REGISTRY)/$(IMAGE_NAME):$(VERSION)
	@echo "$(GREEN)✓ Image verified$(RESET)"

##@ Helm Chart

helm-lint: ## Lint the Helm chart
	@echo "$(GREEN)Linting Helm chart...$(RESET)"
	helm lint deployment/$(RELEASE_NAME)

helm-package: ## Package the Helm chart
	@echo "$(GREEN)Packaging Helm chart version $(VERSION)...$(RESET)"
	helm package deployment/$(RELEASE_NAME) --destination .
	@echo "$(GREEN)✓ Created: $(RELEASE_NAME)-$(VERSION).tgz$(RESET)"

helm-publish: helm-package ## Package and publish Helm chart to GitHub Pages
	@echo "$(GREEN)Publishing Helm chart $(VERSION) to GitHub Pages...$(RESET)"
	@if [ "$$(git branch --show-current)" != "main" ]; then \
		echo "$(YELLOW)Warning: Not on main branch. Current branch: $$(git branch --show-current)$(RESET)"; \
		read -p "Continue? [y/N] " -n 1 -r; \
		echo; \
		if [[ ! $$REPLY =~ ^[Yy]$$ ]]; then \
			echo "Aborted."; \
			exit 1; \
		fi \
	fi
	@git checkout gh-pages
	@git pull origin gh-pages
	@mv $(RELEASE_NAME)-$(VERSION).tgz .
	@helm repo index . --url $(HELM_REPO_URL)
	@git add $(RELEASE_NAME)-$(VERSION).tgz index.yaml
	@git commit -s -m "Release version $(VERSION)"
	@echo "$(GREEN)✓ Helm chart packaged and committed to gh-pages$(RESET)"
	@echo "$(YELLOW)Run 'git push origin gh-pages' to publish$(RESET)"
	@echo "$(YELLOW)Run 'git checkout main' to return to main branch$(RESET)"

verify-helm-repo: ## Verify that the Helm chart is available in the repository
	@echo "$(GREEN)Verifying Helm chart in repository...$(RESET)"
	@helm repo add rh-ecosystem-edge $(HELM_REPO_URL) 2>/dev/null || helm repo update rh-ecosystem-edge
	@helm repo update rh-ecosystem-edge
	@helm search repo $(RELEASE_NAME) --version $(VERSION)
	@echo "$(GREEN)✓ Helm chart verified$(RESET)"

##@ Deployment

install: ## Install the plugin via Helm with commit hash tag
	@echo "$(GREEN)Installing plugin with tag: $(TAG)$(RESET)"
	helm install -n $(NAMESPACE) $(RELEASE_NAME) \
		--set image.repository=$(REGISTRY)/$(IMAGE_NAME) \
		--set image.tag=$(TAG) \
		./deployment/$(RELEASE_NAME)
	@echo "$(GREEN)✓ Successfully installed $(RELEASE_NAME) with tag: $(TAG)$(RESET)"

install-versioned: ## Install the plugin via Helm with version tag
	@echo "$(GREEN)Installing plugin version: $(VERSION)$(RESET)"
	helm install -n $(NAMESPACE) $(RELEASE_NAME) \
		--set image.repository=$(REGISTRY)/$(IMAGE_NAME) \
		--set image.tag=$(VERSION) \
		./deployment/$(RELEASE_NAME)
	@echo "$(GREEN)✓ Successfully installed $(RELEASE_NAME) version: $(VERSION)$(RESET)"

upgrade: ## Upgrade the plugin via Helm
	@echo "$(GREEN)Upgrading plugin...$(RESET)"
	helm upgrade -n $(NAMESPACE) $(RELEASE_NAME) \
		--set image.repository=$(REGISTRY)/$(IMAGE_NAME) \
		--set image.tag=$(TAG) \
		./deployment/$(RELEASE_NAME)
	@echo "$(GREEN)✓ Successfully upgraded $(RELEASE_NAME)$(RESET)"

uninstall: ## Uninstall the plugin via Helm
	@echo "$(GREEN)Uninstalling $(RELEASE_NAME)...$(RESET)"
	helm uninstall -n $(NAMESPACE) $(RELEASE_NAME)
	@echo "$(GREEN)✓ Successfully uninstalled $(RELEASE_NAME)$(RESET)"

##@ ConfigMap Management

update-metrics: ## Update the DCGM metrics configmap from upstream + required metrics
	@echo "$(GREEN)Updating DCGM metrics configmap from upstream source...$(RESET)"
	@./scripts/update-metrics.sh

show-configmap: ## Show the current DCGM metrics configmap
	@echo "$(GREEN)Current DCGM metrics configmap:$(RESET)"
	@cat deployment/$(RELEASE_NAME)/templates/configmap.yaml

edit-required-metrics: ## Edit the list of required metrics for the plugin
	@echo "$(YELLOW)Opening required metrics file for editing...$(RESET)"
	@$${EDITOR:-vi} scripts/required-metrics.csv
	@echo "$(YELLOW)After editing, run 'make update-metrics' to regenerate the configmap$(RESET)"

validate-metrics: ## Validate metrics file is up-to-date (regenerates and compares)
	@echo "$(GREEN)Validating metrics file is up-to-date...$(RESET)"
	@TEMP_BACKUP=$$(mktemp); \
	cp deployment/$(RELEASE_NAME)/files/dcgm-metrics.csv "$$TEMP_BACKUP"; \
	./scripts/update-metrics.sh > /dev/null 2>&1; \
	if ! diff -q "$$TEMP_BACKUP" deployment/$(RELEASE_NAME)/files/dcgm-metrics.csv > /dev/null 2>&1; then \
		echo "$(YELLOW)✗ Metrics file is out of sync$(RESET)"; \
		echo "$(YELLOW)Differences:$(RESET)"; \
		diff -u "$$TEMP_BACKUP" deployment/$(RELEASE_NAME)/files/dcgm-metrics.csv || true; \
		mv "$$TEMP_BACKUP" deployment/$(RELEASE_NAME)/files/dcgm-metrics.csv; \
		echo ""; \
		echo "$(YELLOW)Run 'make update-metrics' to regenerate$(RESET)"; \
		exit 1; \
	else \
		echo "$(GREEN)✓ Metrics file is up-to-date$(RESET)"; \
		rm -f "$$TEMP_BACKUP"; \
	fi

validate-configmap: ## Validate that all required metrics are in the configmap
	@echo "$(GREEN)Validating configmap contains all required metrics...$(RESET)"
	@required_missing=0; \
	while IFS=, read -r metric rest; do \
		if [[ "$$metric" =~ ^DCGM_FI_ ]]; then \
			if ! grep -q "$$metric" deployment/$(RELEASE_NAME)/templates/configmap.yaml; then \
				echo "$(YELLOW)✗ Missing required metric: $$metric$(RESET)"; \
				required_missing=1; \
			fi \
		fi \
	done < scripts/required-metrics.csv; \
	if [ $$required_missing -eq 0 ]; then \
		echo "$(GREEN)✓ All required metrics are present$(RESET)"; \
	else \
		echo "$(YELLOW)Run 'make update-metrics' to fix$(RESET)"; \
		exit 1; \
	fi

##@ Release Management

pre-release-check: ## Run pre-release checks
	@echo "$(GREEN)Running pre-release checks...$(RESET)"
	@echo "$(BLUE)Current version: $(VERSION)$(RESET)"
	@echo "$(BLUE)Chart location: deployment/$(RELEASE_NAME)/Chart.yaml$(RESET)"
	@echo ""
	@echo "$(YELLOW)Checklist:$(RESET)"
	@echo "  [ ] Version bumped in deployment/$(RELEASE_NAME)/Chart.yaml"
	@echo "  [ ] README.md compatibility table updated"
	@echo "  [ ] All tests passing"
	@echo "  [ ] Version bump PR merged to main"
	@echo "  [ ] Metrics file is current"
	@echo ""
	@$(MAKE) validate-metrics
	@$(MAKE) helm-lint
	@$(MAKE) test

validate-release: validate-metrics helm-lint test ## Validate a release
	@echo "$(GREEN)✓ Release validation complete$(RESET)"

release: pre-release-check push-image-versioned helm-publish ## Create a complete release (build, push image, publish chart)
	@echo "$(GREEN)========================================$(RESET)"
	@echo "$(GREEN)Release $(VERSION) preparation complete!$(RESET)"
	@echo "$(GREEN)========================================$(RESET)"
	@echo ""
	@echo "$(YELLOW)Next steps:$(RESET)"
	@echo "  1. Push the Helm chart: git push origin gh-pages"
	@echo "  2. Return to main branch: git checkout main"
	@echo "  3. Create GitHub release at: https://github.com/rh-ecosystem-edge/console-plugin-nvidia-gpu/releases/new"
	@echo "     - Tag: v$(VERSION)"
	@echo "     - Target: main"
	@echo "     - Title: Release v$(VERSION)"
	@echo "  4. Verify the release:"
	@echo "     - make verify-image"
	@echo "     - make verify-helm-repo"

##@ Complete Workflows

all: clean build build-image ## Clean, build, and create container image

deploy: push-image install ## Push image and install to cluster

update: build-image upgrade ## Build new image and upgrade existing installation

package: build helm-package ## Build the plugin and package the Helm chart
	@echo "$(GREEN)✓ Package created: $(RELEASE_NAME)-$(VERSION).tgz$(RESET)"

