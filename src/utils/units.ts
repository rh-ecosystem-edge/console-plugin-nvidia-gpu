/**
 * Copied from console/internal. Dynamic plugin SDK will provide these functions as API in the future.
 */
import { Humanize } from '@openshift-console/dynamic-plugin-sdk';
import * as _ from 'lodash';

const TYPES = {
  numeric: {
    units: ['', 'k', 'm', 'b'],
    space: false,
    divisor: 1000,
  },
  decimalBytes: {
    units: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'],
    space: true,
    divisor: 1000,
  },
  decimalBytesWithoutB: {
    units: ['', 'k', 'M', 'G', 'T', 'P', 'E'],
    space: true,
    divisor: 1000,
  },
  binaryBytes: {
    units: ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'],
    space: true,
    divisor: 1024,
  },
  binaryBytesWithoutB: {
    units: ['i', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei'],
    space: true,
    divisor: 1024,
  },
  SI: {
    units: ['', 'k', 'M', 'G', 'T', 'P', 'E'],
    space: false,
    divisor: 1000,
  },
  decimalBytesPerSec: {
    units: ['Bps', 'KBps', 'MBps', 'GBps', 'TBps', 'PBps', 'EBps'],
    space: true,
    divisor: 1000,
  },
  packetsPerSec: {
    units: ['pps', 'kpps'],
    space: true,
    divisor: 1000,
  },
  seconds: {
    units: ['ns', 'μs', 'ms', 's'],
    space: true,
    divisor: 1000,
  },
  watts: {
    units: ['W', 'KW', 'MW', 'GW', 'TW', 'PW'],
    space: true,
    divisor: 1000,
  },
  hertz: {
    units: ['Hz', 'MHz', 'GHz', 'THz', 'PTz'],
    space: true,
    divisor: 1000,
  },
};

export const getType = (name: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const type = (TYPES as any)[name];
  if (!_.isPlainObject(type)) {
    return {
      units: [],
      space: false,
      divisor: 1000,
    };
  }
  return type;
};

const convertBaseValueToUnits = (
  value: number,
  unitArray: string[],
  divisor: number,
  initialUnit?: string,
  preferredUnit?: string,
) => {
  const sliceIndex = initialUnit ? unitArray.indexOf(initialUnit) : 0;
  const units_ = unitArray.slice(sliceIndex);

  if (preferredUnit || preferredUnit === '') {
    const unitIndex = units_.indexOf(preferredUnit);
    if (unitIndex !== -1) {
      return {
        value: value / divisor ** unitIndex,
        unit: preferredUnit,
      };
    }
  }

  let unit = units_.shift();
  while (value >= divisor && units_.length > 0) {
    value = value / divisor;
    unit = units_.shift();
  }
  return { value, unit };
};

const round = (value: number, fractionDigits?: number) => {
  if (!isFinite(value)) {
    return 0;
  }
  const multiplier = Math.pow(10, fractionDigits || getDefaultFractionDigits(value));
  return Math.round(value * multiplier) / multiplier;
};

const getDefaultFractionDigits = (value: number) => {
  if (value < 1) {
    return 3;
  }
  if (value < 100) {
    return 2;
  }
  return 1;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatValue = (value: number, options?: any) => {
  const fractionDigits = getDefaultFractionDigits(value);
  const { locales, ...rest } = _.defaults(options, {
    maximumFractionDigits: fractionDigits,
  });

  // 2nd check converts -0 to 0.
  if (!isFinite(value) || value === 0) {
    value = 0;
  }
  return Intl.NumberFormat(locales, rest).format(value);
};

const humanize = (
  value: number,
  typeName: string,
  useRound = false,
  initialUnit?: string,
  preferredUnit?: string,
) => {
  const type = getType(typeName);

  if (!isFinite(value)) {
    value = 0;
  }

  let converted = convertBaseValueToUnits(
    value,
    type.units,
    type.divisor,
    initialUnit,
    preferredUnit,
  );

  if (useRound) {
    converted.value = round(converted.value);
    converted = convertBaseValueToUnits(
      converted.value,
      type.units,
      type.divisor,
      converted.unit,
      preferredUnit,
    );
  }

  const formattedValue = formatValue(converted.value);

  return {
    string: type.space ? `${formattedValue} ${converted.unit}` : formattedValue + converted.unit,
    unit: converted.unit as string,
    value: converted.value,
  };
};

type HumanizeFunc = (
  value: number,
  initialUnit?: string,
  preferredUnit?: string,
) => {
  string: string;
  unit: string;
  value: number;
};

export const humanizeBinaryBytesWithoutB: HumanizeFunc = (v, initialUnit, preferredUnit) =>
  humanize(v, 'binaryBytesWithoutB', true, initialUnit, preferredUnit);
export const humanizeBinaryBytes: HumanizeFunc = (v, initialUnit, preferredUnit) =>
  humanize(v, 'binaryBytes', true, initialUnit, preferredUnit);
export const humanizeDecimalBytes: HumanizeFunc = (v, initialUnit, preferredUnit) =>
  humanize(v, 'decimalBytes', true, initialUnit, preferredUnit);
export const humanizeDecimalBytesPerSec: HumanizeFunc = (v, initialUnit, preferredUnit) =>
  humanize(v, 'decimalBytesPerSec', true, initialUnit, preferredUnit);
export const humanizePacketsPerSec: HumanizeFunc = (v, initialUnit, preferredUnit) =>
  humanize(v, 'packetsPerSec', true, initialUnit, preferredUnit);
export const humanizeNumber: HumanizeFunc = (v, initialUnit, preferredUnit) =>
  humanize(v, 'numeric', true, initialUnit, preferredUnit);
export const humanizeNumberSI: HumanizeFunc = (v, initialUnit, preferredUnit) =>
  humanize(v, 'SI', true, initialUnit, preferredUnit);
export const humanizeSeconds: HumanizeFunc = (v, initialUnit, preferredUnit) =>
  humanize(v, 'seconds', true, initialUnit, preferredUnit);
export const humanizeWatts: HumanizeFunc = (v, initialUnit, preferredUnit) =>
  humanize(v, 'watts', true, initialUnit, preferredUnit);
export const humanizeHertz: HumanizeFunc = (v, initialUnit, preferredUnit) =>
  humanize(v, 'hertz', true, initialUnit, preferredUnit);
export const humanizeCpuCores: HumanizeFunc = (v) => {
  const value = v < 1 ? round(v * 1000) : v;
  const unit = v < 1 ? 'm' : '';
  return {
    string: `${formatValue(value)}${unit}`,
    unit,
    value,
  };
};

export const humanizeRatio = (value: number) => {
  // 2nd check converts -0 to 0.
  if (!isFinite(value) || value === 0) {
    value = 0;
  }
  const fDigits = getDefaultFractionDigits(value);

  return {
    string: formatPercentage(value, undefined, fDigits),
    unit: '%',
    value: round(value, fDigits),
  };
};

export const humanizePercentage = (value: number) => {
  // 2nd check converts -0 to 0.
  if (!isFinite(value) || value === 0) {
    value = 0;
  }
  return {
    string: formatPercentage(value / 100),
    unit: '%',
    value: round(value, 1),
  };
};

export const humanizeGPU: Humanize = (value) => ({
  string: `${value}`,
  value: Number.parseInt(`${value}`),
  unit: '',
});

export const humanizeDegrees: Humanize = (value) => ({
  string: `${value} °C`,
  value: Number.parseInt(`${value}`),
  unit: '°C',
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatPercentage = (value: number, options?: any, digits = 1) => {
  const { locales, ...rest } = _.defaults(
    { style: 'percent' }, // Don't allow perent style to be overridden.
    options,
    {
      maximumFractionDigits: digits,
    },
  );
  return Intl.NumberFormat(locales, rest).format(value);
};

export const formatToFractionalDigits = (value: number, digits: number) =>
  Intl.NumberFormat(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

export const formatCores = (cores: number) => formatToFractionalDigits(cores, 3);
