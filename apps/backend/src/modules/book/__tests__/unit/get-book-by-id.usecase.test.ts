import { GetBookByIdUseCase } from '../../application/use-cases/get-book-by-id.usecase';
import type { IBookRepository } from '../../domain/book.repository';

describe('GetBookByIdUseCase', () => {
  let useCase: GetBookByIdUseCase;
  let mockRepository: jest.Mocked<IBookRepository>;

  beforeEach(() => {
    // Create a mock repository with all methods from IBookRepository
    mockRepository = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // Instantiate use case with mocked repository
    useCase = new GetBookByIdUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should call repository.getById() with correct ID', async () => {
      // Arrange
      const bookId = 1;
      const mockBook = { id: 1, title: 'Book 1', available: true };
      mockRepository.getById.mockResolvedValue(mockBook);

      // Act
      const result = await useCase.execute(bookId);

      // Assert
      expect(mockRepository.getById).toHaveBeenCalledWith(bookId);
      expect(mockRepository.getById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBook);
    });

    it('should return book data when found', async () => {
      // Arrange
      const bookId = 42;
      const mockBook = {
        id: 42,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        available: true,
        quantity: 5,
      };
      mockRepository.getById.mockResolvedValue(mockBook);

      // Act
      const result = await useCase.execute(bookId);

      // Assert
      expect(result).toEqual(mockBook);
      expect((result as Record<string, unknown>).title).toBe('The Great Gatsby');
      expect((result as Record<string, unknown>).author).toBe('F. Scott Fitzgerald');
    });

    it('should handle different ID values correctly', async () => {
      // Arrange
      const bookId = 999;
      const mockBook = { id: 999, title: 'Rare Book', available: false };
      mockRepository.getById.mockResolvedValue(mockBook);

      // Act
      const result = await useCase.execute(bookId);

      // Assert
      expect(mockRepository.getById).toHaveBeenCalledWith(999);
      expect(result).toEqual(mockBook);
    });

    it('should handle ID 0 correctly', async () => {
      // Arrange
      const bookId = 0;
      const mockBook = { id: 0, title: 'Book Zero', available: true };
      mockRepository.getById.mockResolvedValue(mockBook);

      // Act
      const result = await useCase.execute(bookId);

      // Assert
      expect(mockRepository.getById).toHaveBeenCalledWith(0);
      expect(result).toEqual(mockBook);
    });

    it('should handle large ID values correctly', async () => {
      // Arrange
      const bookId = 999999;
      const mockBook = { id: 999999, title: 'Large ID Book', available: true };
      mockRepository.getById.mockResolvedValue(mockBook);

      // Act
      const result = await useCase.execute(bookId);

      // Assert
      expect(mockRepository.getById).toHaveBeenCalledWith(999999);
      expect(result).toEqual(mockBook);
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const bookId = 1;
      const error = new Error('Book not found');
      mockRepository.getById.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(bookId)).rejects.toThrow('Book not found');
      expect(mockRepository.getById).toHaveBeenCalledWith(bookId);
    });

    it('should handle database connection errors', async () => {
      // Arrange
      const bookId = 5;
      const error = new Error('Database connection failed');
      mockRepository.getById.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(bookId)).rejects.toThrow('Database connection failed');
      expect(mockRepository.getById).toHaveBeenCalledWith(bookId);
    });

    it('should handle query execution errors', async () => {
      // Arrange
      const bookId = 10;
      const error = new Error('Query execution failed');
      mockRepository.getById.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(bookId)).rejects.toThrow('Query execution failed');
      expect(mockRepository.getById).toHaveBeenCalledWith(bookId);
    });

    it('should not call other repository methods', async () => {
      // Arrange
      const bookId = 1;
      mockRepository.getById.mockResolvedValue({ id: 1, title: 'Book 1' });

      // Act
      await useCase.execute(bookId);

      // Assert
      expect(mockRepository.getAll).not.toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.update).not.toHaveBeenCalled();
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should call repository exactly once per execution', async () => {
      // Arrange
      const bookId = 7;
      mockRepository.getById.mockResolvedValue({ id: 7, title: 'Book 7' });

      // Act
      await useCase.execute(bookId);
      await useCase.execute(bookId);

      // Assert
      expect(mockRepository.getById).toHaveBeenCalledTimes(2);
      expect(mockRepository.getById).toHaveBeenNthCalledWith(1, bookId);
      expect(mockRepository.getById).toHaveBeenNthCalledWith(2, bookId);
    });

    it('should handle empty object results', async () => {
      // Arrange
      const bookId = 999;
      const emptyBook = {};
      mockRepository.getById.mockResolvedValue(emptyBook);

      // Act
      const result = await useCase.execute(bookId);

      // Assert
      expect(mockRepository.getById).toHaveBeenCalledWith(bookId);
      expect(result).toEqual(emptyBook);
    });
  });
});
