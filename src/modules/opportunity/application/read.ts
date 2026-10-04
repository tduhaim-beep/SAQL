export interface PublishedOpportunity {
  id: string;
  organizationId: string;
  organizationName: string;
  titleAr: string;
  descriptionAr: string;
  city: string | null;
  programType: string;
  startsAt: string | null;
  endsAt: string | null;
}

export interface PublishedOpportunityReader {
  findPublished(id: string): Promise<PublishedOpportunity | null>;
}
