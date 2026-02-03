/**
 * Loan entity representation
 * Used within the application for loan data
 */
export type LoanEntity = {
  id: number;
  userId: number;
  bookId: number;
  loanDate: Date;
  dueDate: Date;
  returnedDate: Date | null;
  status: string;
  extensions: number;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  book?: {
    id: number;
    title: string;
    author: string;
  };
};
