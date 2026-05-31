export const STATEMENT_MIN_PERIOD = { month: 1, year: 2025 } as const;
export const STATEMENT_MAX_PERIOD = { month: 6, year: 2026 } as const;

export type StatementPeriod = {
  startMonth: number;
  startYear: number;
  endMonth: number;
  endYear: number;
};

function periodToSortKey(month: number, year: number) {
  return year * 12 + month;
}

export function isPeriodInAllowedRange(month: number, year: number) {
  const value = periodToSortKey(month, year);
  const min = periodToSortKey(STATEMENT_MIN_PERIOD.month, STATEMENT_MIN_PERIOD.year);
  const max = periodToSortKey(STATEMENT_MAX_PERIOD.month, STATEMENT_MAX_PERIOD.year);
  return value >= min && value <= max;
}

export function parseStatementPeriodValue(value: string | null) {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);

  if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) {
    return null;
  }

  if (!isPeriodInAllowedRange(month, year)) {
    return null;
  }

  return { month, year };
}

export function resolveStatementPeriod(params: {
  fromMonth?: number | null;
  fromYear?: number | null;
  toMonth?: number | null;
  toYear?: number | null;
  month?: number | null;
  year?: number | null;
}): StatementPeriod | null {
  if (
    params.fromMonth !== null &&
    params.fromMonth !== undefined &&
    params.fromYear !== null &&
    params.fromYear !== undefined &&
    params.toMonth !== null &&
    params.toMonth !== undefined &&
    params.toYear !== null &&
    params.toYear !== undefined
  ) {
    if (
      !isPeriodInAllowedRange(params.fromMonth, params.fromYear) ||
      !isPeriodInAllowedRange(params.toMonth, params.toYear)
    ) {
      return null;
    }

    if (
      periodToSortKey(params.fromMonth, params.fromYear) >
      periodToSortKey(params.toMonth, params.toYear)
    ) {
      return null;
    }

    return {
      startMonth: params.fromMonth,
      startYear: params.fromYear,
      endMonth: params.toMonth,
      endYear: params.toYear,
    };
  }

  if (params.month === null || params.month === undefined || params.year === null || params.year === undefined) {
    return null;
  }

  if (!isPeriodInAllowedRange(params.month, params.year)) {
    return null;
  }

  return {
    startMonth: params.month,
    startYear: params.year,
    endMonth: params.month,
    endYear: params.year,
  };
}

export function formatStatementPeriodLabel(period: StatementPeriod) {
  const formatMonthYear = (month: number, year: number) =>
    new Date(year, month - 1, 1).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

  if (
    period.startMonth === period.endMonth &&
    period.startYear === period.endYear
  ) {
    return formatMonthYear(period.startMonth, period.startYear);
  }

  return `${formatMonthYear(period.startMonth, period.startYear)} – ${formatMonthYear(period.endMonth, period.endYear)}`;
}

export function buildStatementMonthOptions() {
  const options: Array<{ value: string; label: string }> = [];
  let year: number = STATEMENT_MIN_PERIOD.year;
  let month: number = STATEMENT_MIN_PERIOD.month;

  while (
    year < STATEMENT_MAX_PERIOD.year ||
    (year === STATEMENT_MAX_PERIOD.year && month <= STATEMENT_MAX_PERIOD.month)
  ) {
    const value = `${year}-${String(month).padStart(2, "0")}`;
    const label = new Date(year, month - 1, 1).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
    options.push({ value, label });

    month += 1;

    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return options;
}

export function getDefaultStatementPeriodValue() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  if (isPeriodInAllowedRange(month, year)) {
    return `${year}-${String(month).padStart(2, "0")}`;
  }

  return `${STATEMENT_MAX_PERIOD.year}-${String(STATEMENT_MAX_PERIOD.month).padStart(2, "0")}`;
}
