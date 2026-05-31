export const memberPageMetaByPath: Record<string, { titleKey: string; subtitleKey?: string }> = {
  "/auth/dashboard": {
    titleKey: "member.pages.dashboard.title",
    subtitleKey: "member.pages.dashboard.subtitle",
  },
  "/auth/accounts": {
    titleKey: "member.pages.accounts.title",
    subtitleKey: "member.pages.accounts.subtitle",
  },
  "/auth/transactions": {
    titleKey: "member.pages.transactions.title",
    subtitleKey: "member.pages.transactions.subtitle",
  },
  "/auth/transfers": {
    titleKey: "member.pages.transfers.title",
    subtitleKey: "member.pages.transfers.subtitle",
  },
  "/auth/bill-pay": {
    titleKey: "member.pages.billPay.title",
    subtitleKey: "member.pages.billPay.subtitle",
  },
  "/auth/statements": {
    titleKey: "member.pages.statements.title",
    subtitleKey: "member.pages.statements.subtitle",
  },
  "/auth/payees": {
    titleKey: "member.pages.payees.title",
    subtitleKey: "member.pages.payees.subtitle",
  },
  "/auth/cards": {
    titleKey: "member.pages.cards.title",
    subtitleKey: "member.pages.cards.subtitle",
  },
  "/auth/loans": {
    titleKey: "member.pages.loans.title",
    subtitleKey: "member.pages.loans.subtitle",
  },
  "/auth/disputes": {
    titleKey: "member.pages.disputes.title",
    subtitleKey: "member.pages.disputes.subtitle",
  },
  "/auth/support": {
    titleKey: "member.pages.support.title",
    subtitleKey: "member.pages.support.subtitle",
  },
  "/auth/notifications": {
    titleKey: "member.pages.notifications.title",
    subtitleKey: "member.pages.notifications.subtitle",
  },
  "/auth/profile": {
    titleKey: "member.pages.profile.title",
    subtitleKey: "member.pages.profile.subtitle",
  },
  "/auth/security": {
    titleKey: "member.pages.security.title",
    subtitleKey: "member.pages.security.subtitle",
  },
  "/auth/settings": {
    titleKey: "member.pages.settings.title",
    subtitleKey: "member.pages.settings.subtitle",
  },
  "/auth/forgot-transaction-pin": {
    titleKey: "member.pages.forgotTransactionPin.title",
    subtitleKey: "member.pages.forgotTransactionPin.subtitle",
  },
};

export const adminPageMetaByPath: Record<string, { titleKey: string; subtitleKey?: string }> = {
  "/lex/auth/dashboard": {
    titleKey: "admin.pages.dashboard.title",
    subtitleKey: "admin.pages.dashboard.subtitle",
  },
  "/lex/auth/alerts": {
    titleKey: "admin.pages.alerts.title",
    subtitleKey: "admin.pages.alerts.subtitle",
  },
  "/lex/auth/users": {
    titleKey: "admin.pages.users.title",
    subtitleKey: "admin.pages.users.subtitle",
  },
  "/lex/auth/accounts": {
    titleKey: "admin.pages.accounts.title",
    subtitleKey: "admin.pages.accounts.subtitle",
  },
  "/lex/auth/compliance": {
    titleKey: "admin.pages.compliance.title",
    subtitleKey: "admin.pages.compliance.subtitle",
  },
  "/lex/auth/id-verifications": {
    titleKey: "admin.pages.idVerifications.title",
    subtitleKey: "admin.pages.idVerifications.subtitle",
  },
  "/lex/auth/sessions": {
    titleKey: "admin.pages.sessions.title",
    subtitleKey: "admin.pages.sessions.subtitle",
  },
  "/lex/auth/transactions": {
    titleKey: "admin.pages.transactions.title",
    subtitleKey: "admin.pages.transactions.subtitle",
  },
  "/lex/auth/transfer-reviews": {
    titleKey: "admin.pages.transferReviews.title",
    subtitleKey: "admin.pages.transferReviews.subtitle",
  },
  "/lex/auth/bill-pay": {
    titleKey: "admin.pages.billPay.title",
    subtitleKey: "admin.pages.billPay.subtitle",
  },
  "/lex/auth/card-applications": {
    titleKey: "admin.pages.cardApplications.title",
    subtitleKey: "admin.pages.cardApplications.subtitle",
  },
  "/lex/auth/adjustments": {
    titleKey: "admin.pages.adjustments.title",
    subtitleKey: "admin.pages.adjustments.subtitle",
  },
  "/lex/auth/transaction-generator": {
    titleKey: "admin.pages.transactionGenerator.title",
    subtitleKey: "admin.pages.transactionGenerator.subtitle",
  },
  "/lex/auth/transfer-verification": {
    titleKey: "admin.pages.transferVerification.title",
    subtitleKey: "admin.pages.transferVerification.subtitle",
  },
  "/lex/auth/reconciliation": {
    titleKey: "admin.pages.reconciliation.title",
    subtitleKey: "admin.pages.reconciliation.subtitle",
  },
  "/lex/auth/risk": {
    titleKey: "admin.pages.risk.title",
    subtitleKey: "admin.pages.risk.subtitle",
  },
  "/lex/auth/disputes": {
    titleKey: "admin.pages.disputes.title",
    subtitleKey: "admin.pages.disputes.subtitle",
  },
  "/lex/auth/audit-logs": {
    titleKey: "admin.pages.auditLogs.title",
    subtitleKey: "admin.pages.auditLogs.subtitle",
  },
  "/lex/auth/event-logs": {
    titleKey: "admin.pages.eventLogs.title",
    subtitleKey: "admin.pages.eventLogs.subtitle",
  },
  "/lex/auth/support": {
    titleKey: "admin.pages.support.title",
    subtitleKey: "admin.pages.support.subtitle",
  },
  "/lex/auth/jobs": {
    titleKey: "admin.pages.jobs.title",
    subtitleKey: "admin.pages.jobs.subtitle",
  },
  "/lex/auth/finance-reports": {
    titleKey: "admin.pages.financeReports.title",
    subtitleKey: "admin.pages.financeReports.subtitle",
  },
  "/lex/auth/settings": {
    titleKey: "admin.pages.settings.title",
    subtitleKey: "admin.pages.settings.subtitle",
  },
  "/lex/auth": {
    titleKey: "admin.pages.login.title",
    subtitleKey: "admin.pages.login.subtitle",
  },
};

export function resolveMemberAccountDetailMeta(pathname: string) {
  if (pathname.startsWith("/auth/accounts/") && pathname !== "/auth/accounts") {
    return {
      titleKey: "member.pages.accountDetail.title",
      subtitleKey: "member.pages.accountDetail.subtitle",
    };
  }

  return null;
}

export function resolvePageMeta(
  pathname: string,
  scope: "member" | "admin",
): { titleKey: string; subtitleKey?: string } | null {
  if (scope === "member") {
    const accountDetail = resolveMemberAccountDetailMeta(pathname);
    if (accountDetail) {
      return accountDetail;
    }

    return memberPageMetaByPath[pathname] ?? null;
  }

  return adminPageMetaByPath[pathname] ?? null;
}
