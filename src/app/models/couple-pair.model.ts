export type PairStatus = 'pending' | 'accepted';

export interface CouplePair {
  id?: string;
  requesterId: string;
  requesterUsername: string;
  receiverId: string;
  receiverUsername: string;
  status: PairStatus;
  createdAt: Date;
}
