/**
 * Comprehensive Payroll Calculation Utilities
 * Handles salary calculations, deductions, taxes, and compliance
 */

// Tax Slabs for FY 2025-26 (New Tax Regime)
const TAX_SLABS_NEW = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300001, max: 700000, rate: 5 },
  { min: 700001, max: 1000000, rate: 10 },
  { min: 1000001, max: 1200000, rate: 15 },
  { min: 1200001, max: 1500000, rate: 20 },
  { min: 1500001, max: Infinity, rate: 30 }
];

// Professional Tax Slabs (Maharashtra)
const PROFESSIONAL_TAX_SLABS = [
  { min: 0, max: 7500, tax: 0 },
  { min: 7501, max: 10000, tax: 175 },
  { min: 10001, max: Infinity, tax: 200 }
];

// Statutory Rates
const STATUTORY_RATES = {
  PF_EMPLOYEE: 12, // 12% of Basic
  PF_EMPLOYER: 12, // 12% of Basic (employer contribution)
  ESI_EMPLOYEE: 0.75, // 0.75% of Gross (if salary <= 21,000)
  ESI_EMPLOYER: 3.25, // 3.25% of Gross (employer contribution)
  ESI_THRESHOLD: 21000, // ESI applicable if gross <= 21,000
  PF_CEILING: 15000, // Max basic for PF calculation
};

/**
 * Calculate gross earnings from salary components
 */
export function calculateGrossEarnings(salaryComponents) {
  const {
    basicSalary = 0,
    hra = 0,
    conveyance = 0,
    medical = 0,
    specialAllowance = 0,
    bonus = 0,
    overtime = 0,
    incentives = 0,
    otherAllowances = 0
  } = salaryComponents;

  return (
    parseFloat(basicSalary) +
    parseFloat(hra) +
    parseFloat(conveyance) +
    parseFloat(medical) +
    parseFloat(specialAllowance) +
    parseFloat(bonus) +
    parseFloat(overtime) +
    parseFloat(incentives) +
    parseFloat(otherAllowances)
  );
}

/**
 * Calculate PF (Provident Fund) deduction
 */
export function calculatePF(basicSalary) {
  const basic = parseFloat(basicSalary) || 0;
  const pfBase = Math.min(basic, STATUTORY_RATES.PF_CEILING);
  return Math.round((pfBase * STATUTORY_RATES.PF_EMPLOYEE) / 100);
}

/**
 * Calculate ESI (Employee State Insurance) deduction
 */
export function calculateESI(grossSalary) {
  const gross = parseFloat(grossSalary) || 0;
  
  // ESI only applicable if gross salary <= threshold
  if (gross > STATUTORY_RATES.ESI_THRESHOLD) {
    return 0;
  }
  
  return Math.round((gross * STATUTORY_RATES.ESI_EMPLOYEE) / 100);
}

/**
 * Calculate Professional Tax based on monthly gross
 */
export function calculateProfessionalTax(grossSalary, state = 'Maharashtra') {
  const gross = parseFloat(grossSalary) || 0;
  
  // Currently supports Maharashtra, can be extended
  if (state !== 'Maharashtra') {
    return 0;
  }
  
  for (const slab of PROFESSIONAL_TAX_SLABS) {
    if (gross >= slab.min && gross <= slab.max) {
      return slab.tax;
    }
  }
  
  return 200; // Default max PT
}

/**
 * Calculate annual TDS based on annual salary
 */
export function calculateAnnualTDS(annualGross, deductions = {}) {
  const {
    section80C = 150000, // Max 1.5L
    section80D = 25000,  // Health insurance
    hra = 0,
    standardDeduction = 50000
  } = deductions;

  // Calculate taxable income
  let taxableIncome = annualGross - standardDeduction - section80C - section80D - hra;
  taxableIncome = Math.max(0, taxableIncome);

  // Calculate tax based on new regime
  let tax = 0;
  for (const slab of TAX_SLABS_NEW) {
    if (taxableIncome > slab.min) {
      const taxableInSlab = Math.min(taxableIncome, slab.max) - slab.min;
      tax += (taxableInSlab * slab.rate) / 100;
    }
  }

  // Add 4% cess
  tax = tax * 1.04;

  return Math.round(tax);
}

/**
 * Calculate monthly TDS
 */
export function calculateMonthlyTDS(monthlyGross, annualProjection = null) {
  const annual = annualProjection || (monthlyGross * 12);
  const annualTDS = calculateAnnualTDS(annual);
  return Math.round(annualTDS / 12);
}

/**
 * Calculate attendance-based salary
 */
export function calculateAttendanceBasedSalary(
  basicSalary,
  totalWorkingDays,
  presentDays,
  paidLeaveDays = 0
) {
  const basic = parseFloat(basicSalary) || 0;
  const working = parseFloat(totalWorkingDays) || 26;
  const present = parseFloat(presentDays) || 0;
  const paidLeave = parseFloat(paidLeaveDays) || 0;

  const effectiveDays = present + paidLeave;
  const perDaySalary = basic / working;
  
  return Math.round(perDaySalary * effectiveDays);
}

/**
 * Calculate all deductions
 */
export function calculateTotalDeductions(deductionComponents) {
  const {
    pf = 0,
    esi = 0,
    professionalTax = 0,
    tds = 0,
    loanRecovery = 0,
    advanceRecovery = 0,
    otherDeductions = 0
  } = deductionComponents;

  return (
    parseFloat(pf) +
    parseFloat(esi) +
    parseFloat(professionalTax) +
    parseFloat(tds) +
    parseFloat(loanRecovery) +
    parseFloat(advanceRecovery) +
    parseFloat(otherDeductions)
  );
}

/**
 * Calculate net salary
 */
export function calculateNetSalary(grossEarnings, totalDeductions) {
  return Math.round(grossEarnings - totalDeductions);
}

/**
 * Auto-calculate complete payroll for an employee
 */
export function autoCalculatePayroll(employee, attendanceData, advancesAndLoans = {}) {
  const {
    basicSalary = 0,
    hra = 0,
    conveyance = 0,
    medical = 0,
    specialAllowance = 0,
    bonus = 0,
    overtime = 0,
    incentives = 0
  } = employee;

  const {
    totalWorkingDays = 26,
    presentDays = 26,
    paidLeaveDays = 0
  } = attendanceData;

  const {
    loanRecovery = 0,
    advanceRecovery = 0
  } = advancesAndLoans;

  // Calculate attendance-adjusted basic salary
  const adjustedBasic = calculateAttendanceBasedSalary(
    basicSalary,
    totalWorkingDays,
    presentDays,
    paidLeaveDays
  );

  // Calculate other components proportionally
  const attendanceRatio = (presentDays + paidLeaveDays) / totalWorkingDays;
  
  const adjustedHRA = Math.round(hra * attendanceRatio);
  const adjustedConveyance = Math.round(conveyance * attendanceRatio);
  const adjustedMedical = Math.round(medical * attendanceRatio);
  const adjustedSpecial = Math.round(specialAllowance * attendanceRatio);

  // Gross earnings
  const grossEarnings = calculateGrossEarnings({
    basicSalary: adjustedBasic,
    hra: adjustedHRA,
    conveyance: adjustedConveyance,
    medical: adjustedMedical,
    specialAllowance: adjustedSpecial,
    bonus,
    overtime,
    incentives
  });

  // Calculate deductions
  const pf = calculatePF(adjustedBasic);
  const esi = calculateESI(grossEarnings);
  const professionalTax = calculateProfessionalTax(grossEarnings);
  const tds = calculateMonthlyTDS(grossEarnings);

  const totalDeductions = calculateTotalDeductions({
    pf,
    esi,
    professionalTax,
    tds,
    loanRecovery,
    advanceRecovery
  });

  const netSalary = calculateNetSalary(grossEarnings, totalDeductions);

  return {
    // Earnings
    basicSalary: adjustedBasic,
    hra: adjustedHRA,
    conveyance: adjustedConveyance,
    medical: adjustedMedical,
    specialAllowance: adjustedSpecial,
    bonus: parseFloat(bonus) || 0,
    overtime: parseFloat(overtime) || 0,
    incentives: parseFloat(incentives) || 0,
    grossEarnings,

    // Deductions
    pf,
    esi,
    professionalTax,
    tds,
    loanRecovery: parseFloat(loanRecovery) || 0,
    advanceRecovery: parseFloat(advanceRecovery) || 0,
    totalDeductions,

    // Net
    netSalary,

    // Attendance
    totalWorkingDays,
    presentDays,
    paidLeaveDays,
    absentDays: totalWorkingDays - presentDays - paidLeaveDays,
    attendancePercentage: Math.round(((presentDays + paidLeaveDays) / totalWorkingDays) * 100)
  };
}

/**
 * Calculate loan EMI
 */
export function calculateLoanEMI(principal, annualRate, tenureMonths) {
  const p = parseFloat(principal);
  const r = parseFloat(annualRate) / 12 / 100; // Monthly rate
  const n = parseFloat(tenureMonths);

  if (r === 0) {
    return Math.round(p / n);
  }

  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
}

/**
 * Generate loan amortization schedule
 */
export function generateLoanSchedule(principal, annualRate, tenureMonths, startDate) {
  const emi = calculateLoanEMI(principal, annualRate, tenureMonths);
  const monthlyRate = parseFloat(annualRate) / 12 / 100;
  let balance = parseFloat(principal);
  const schedule = [];

  const start = new Date(startDate);

  for (let month = 1; month <= tenureMonths; month++) {
    const interest = Math.round(balance * monthlyRate);
    const principalPaid = emi - interest;
    balance = Math.max(0, balance - principalPaid);

    const paymentDate = new Date(start);
    paymentDate.setMonth(start.getMonth() + month);

    schedule.push({
      month,
      paymentDate: paymentDate.toISOString().split('T')[0],
      emi,
      principal: principalPaid,
      interest,
      balance: Math.round(balance)
    });
  }

  return schedule;
}

/**
 * Calculate CTC (Cost to Company)
 */
export function calculateCTC(employee) {
  const {
    basicSalary = 0,
    hra = 0,
    conveyance = 0,
    medical = 0,
    specialAllowance = 0,
    bonus = 0
  } = employee;

  const monthlyGross = calculateGrossEarnings(employee);
  const annualGross = monthlyGross * 12;

  // Employer contributions
  const pfEmployer = calculatePF(basicSalary) * 12;
  const esiEmployer = calculateESI(monthlyGross) > 0 
    ? Math.round((monthlyGross * STATUTORY_RATES.ESI_EMPLOYER) / 100) * 12 
    : 0;

  const ctc = annualGross + pfEmployer + esiEmployer;

  return {
    monthlyCTC: Math.round(ctc / 12),
    annualCTC: Math.round(ctc),
    monthlyGross,
    annualGross,
    employerPF: pfEmployer,
    employerESI: esiEmployer
  };
}

/**
 * Validate payroll data
 */
export function validatePayrollData(payrollData) {
  const errors = [];

  if (!payrollData.employeeId) {
    errors.push('Employee ID is required');
  }

  if (!payrollData.month || !payrollData.year) {
    errors.push('Payroll period (month/year) is required');
  }

  if (!payrollData.basicSalary || payrollData.basicSalary <= 0) {
    errors.push('Valid basic salary is required');
  }

  if (payrollData.presentDays > payrollData.totalWorkingDays) {
    errors.push('Present days cannot exceed total working days');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Get payroll summary statistics
 */
export function getPayrollSummary(payrollRecords) {
  const summary = {
    totalEmployees: payrollRecords.length,
    totalGross: 0,
    totalDeductions: 0,
    totalNet: 0,
    totalPF: 0,
    totalESI: 0,
    totalTDS: 0,
    averageGross: 0,
    averageNet: 0
  };

  payrollRecords.forEach(record => {
    summary.totalGross += record.grossEarnings || 0;
    summary.totalDeductions += record.totalDeductions || 0;
    summary.totalNet += record.netSalary || 0;
    summary.totalPF += record.pf || 0;
    summary.totalESI += record.esi || 0;
    summary.totalTDS += record.tds || 0;
  });

  if (summary.totalEmployees > 0) {
    summary.averageGross = Math.round(summary.totalGross / summary.totalEmployees);
    summary.averageNet = Math.round(summary.totalNet / summary.totalEmployees);
  }

  return summary;
}
