.PHONY: help build-dev-image build lint type-check i18n clean update-lockfile \
        build-image push-image helm-lint deploy undeploy

# Configuration
REGISTRY ?= quay.io/edge-infrastructure
IMAGE_NAME ?= console-plugin-nvidia-gpu
IMAGE_TAG ?= $(shell git rev-parse --short HEAD)
NAMESPACE ?= nvidia-gpu-operator
RELEASE_NAME ?= console-plugin-nvidia-gpu

# Container runtime (podman preferred, falls back to docker)
CONTAINER_TOOL ?= $(shell command -v podman 2>/dev/null || echo docker)
DEV_IMAGE ?= $(IMAGE_NAME)-dev

# Colors for output
BLUE := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RESET := \033[0m

# All JS/TS targets run inside a container (no Node.js required on host).
# Run 'make build-dev-image' once before using other targets.
# For hot-reload development, use: yarn start (requires Node.js on host)

help: ## Show this help
	@printf "$(BLUE)Available targets:$(RESET)\n"
	@printf "\n"
	@printf "$(YELLOW)Development (containerized - no Node.js required):$(RESET)\n"
	@grep -E '^(build-dev-image|build|lint|type-check|i18n|clean|update-lockfile):.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(BLUE)%-18s$(RESET) %s\n", $$1, $$2}'
	@printf "\n"
	@printf "$(YELLOW)Container Image:$(RESET)\n"
	@grep -E '^(build-image|push-image):.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(BLUE)%-18s$(RESET) %s\n", $$1, $$2}'
	@printf "\n"
	@printf "$(YELLOW)Helm:$(RESET)\n"
	@grep -E '^(helm-lint|deploy|undeploy):.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(BLUE)%-18s$(RESET) %s\n", $$1, $$2}'
	@printf "\n"
	@printf "$(YELLOW)Variables:$(RESET)\n"
	@printf "  IMAGE_TAG=$(IMAGE_TAG)  (default: git commit hash)\n"
	@printf "  NAMESPACE=$(NAMESPACE)\n"
	@printf "\n"
	@printf "$(YELLOW)Examples:$(RESET)\n"
	@printf "  make build-dev-image            # Run once to create dev container\n"
	@printf "  make build-image IMAGE_TAG=0.3.0\n"
	@printf "  make deploy NAMESPACE=my-namespace\n"

##@ Development (containerized)

build-dev-image: ## Build the dev container image (run once)
	@printf "$(GREEN)Building dev image: $(DEV_IMAGE)...$(RESET)\n"
	$(CONTAINER_TOOL) build -t $(DEV_IMAGE) -f Dockerfile.dev .
	@printf "$(GREEN)✓ Dev image ready. Run 'make build', 'make lint', etc.$(RESET)\n"

build: ## Build plugin for production
	@printf "$(GREEN)Building plugin (containerized)...$(RESET)\n"
	@$(CONTAINER_TOOL) run --rm \
		-v "$(CURDIR):/workspace:z" \
		-w /workspace \
		$(DEV_IMAGE) \
		sh -c "yarn install --frozen-lockfile && yarn build"

lint: ## Lint the code
	@printf "$(GREEN)Linting code (containerized)...$(RESET)\n"
	@$(CONTAINER_TOOL) run --rm \
		-v "$(CURDIR):/workspace:z" \
		-w /workspace \
		$(DEV_IMAGE) \
		sh -c "yarn install --frozen-lockfile && yarn lint"

type-check: ## Check TypeScript types
	@printf "$(GREEN)Type checking (containerized)...$(RESET)\n"
	@$(CONTAINER_TOOL) run --rm \
		-v "$(CURDIR):/workspace:z" \
		-w /workspace \
		$(DEV_IMAGE) \
		sh -c "yarn install --frozen-lockfile && yarn type-check"

i18n: ## Generate i18n translations
	@printf "$(GREEN)Generating i18n (containerized)...$(RESET)\n"
	@$(CONTAINER_TOOL) run --rm \
		-v "$(CURDIR):/workspace:z" \
		-w /workspace \
		$(DEV_IMAGE) \
		sh -c "yarn install --frozen-lockfile && yarn i18n"

clean: ## Clean build artifacts
	@printf "$(GREEN)Cleaning build artifacts...$(RESET)\n"
	@$(CONTAINER_TOOL) unshare rm -rf dist/ node_modules/ *.tgz 2>/dev/null \
		|| (printf "$(YELLOW)Falling back to regular rm...$(RESET)\n" && rm -rf dist/ node_modules/ *.tgz)

update-lockfile: ## Regenerate yarn.lock
	@printf "$(GREEN)Regenerating yarn.lock (containerized)...$(RESET)\n"
	@$(CONTAINER_TOOL) run --rm \
		-v "$(CURDIR):/workspace:z" \
		-w /workspace \
		$(DEV_IMAGE) \
		sh -c "rm -f yarn.lock && yarn install --ignore-engines"
	@printf "$(GREEN)✓ yarn.lock regenerated$(RESET)\n"

##@ Container Image

build-image: ## Build container image
	@printf "$(GREEN)Building image: $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)$(RESET)\n"
	$(CONTAINER_TOOL) build -t $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG) .

push-image: build-image ## Build and push container image
	@printf "$(GREEN)Pushing image: $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)$(RESET)\n"
	$(CONTAINER_TOOL) push $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	@printf "$(GREEN)✓ Pushed: $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)$(RESET)\n"

##@ Helm

helm-lint: ## Lint the Helm chart
	@printf "$(GREEN)Linting Helm chart...$(RESET)\n"
	helm lint deployment/$(RELEASE_NAME)

deploy: ## Deploy plugin to cluster (install or upgrade)
	@printf "$(GREEN)Deploying plugin...$(RESET)\n"
	helm upgrade --install -n $(NAMESPACE) --create-namespace $(RELEASE_NAME) \
		--set image.repository=$(REGISTRY)/$(IMAGE_NAME) \
		--set image.tag=$(IMAGE_TAG) \
		./deployment/$(RELEASE_NAME)
	@printf "$(GREEN)✓ Deployed $(RELEASE_NAME)$(RESET)\n"

undeploy: ## Remove plugin from cluster
	@printf "$(GREEN)Removing $(RELEASE_NAME)...$(RESET)\n"
	helm uninstall -n $(NAMESPACE) $(RELEASE_NAME)
	@printf "$(GREEN)✓ Removed $(RELEASE_NAME)$(RESET)\n"
