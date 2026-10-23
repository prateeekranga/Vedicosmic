/**
 * Business and grievance details for the /legal page, as the Consumer Protection
 * (E-Commerce) Rules, 2020 expect before anything is sold. Draft for lawyer review.
 *
 * [OWNER TO PROVIDE] legal entity name (or your own name as operator), registered address,
 * and the grievance officer's name, email and phone. Until they are filled in, LEGAL stays
 * null: /legal shows "page not found" and no page links to it, so nothing unfinished ships.
 * scripts/check-claims.mjs fails the build if the marker above ever reaches the built site.
 */
export interface LegalDetails {
  entityName: string;
  registeredAddress: string;
  grievanceOfficer: { name: string; email: string; phone: string };
  /** Kept to the Rules: acknowledge within 48 hours, resolve within one month. */
  responseTimes: string;
  /** Refund terms, written when something is sold. */
  refundPolicy: string;
}

export const LEGAL: LegalDetails | null = null;
