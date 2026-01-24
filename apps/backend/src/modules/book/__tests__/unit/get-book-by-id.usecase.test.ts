import { GetBookByIdUseCase } from '../../application/use-case/get-book-by-id.usecase';
import type { IBookRepository } from '../../domain/interface/book.repository';

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
      const mockBook = {
        id: 1,
        title: 'Book 1',
        author: 'Author 1',
        description: 'Description 1',
        categoryId: 1,
        price: 10.99,
        purchaseStock: 10,
        rentalStock: 5,
        available: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
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
        description: 'A classic American novel',
        categoryId: 2,
        price: 15.99,
        purchaseStock: 5,
        rentalStock: 3,
        available: true,
        createdAt: new Date(),
        updatedAt: new Date(),
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
      const mockBook = {
        id: 999,
        title: 'Rare Book',
        author: 'Unknown Author',
        description: 'A rare collectible',
        categoryId: 3,
        price: 99.99,
        purchaseStock: 1,
        rentalStock: 0,
        available: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
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
      const mockBook = {
        id: 0,
        title: 'Book Zero',
        author: 'Zero Author',
        description: 'Test book with ID 0',
        categoryId: 1,
        price: 0.99,
        purchaseStock: 0,
        rentalStock: 0,
        available: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
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
      const mockBook = {
        id: 999999,
        title: 'Large ID Book',
        author: 'Large ID Author',
        description: 'Book with large ID',
        categoryId: 5,
        price: 29.99,
        purchaseStock: 100,
        rentalStock: 50,
        available: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
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
      mockRepository.getById.mockResolvedValue({
        id: 1,
        title: 'Book 1',
        author: 'Author 1',
        description: 'Description 1',
        categoryId: 1,
        price: 10.99,
        purchaseStock: 10,
        rentalStock: 5,
        available: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

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
      mockRepository.getById.mockResolvedValue({
        id: 7,
        title: 'Book 7',
        author: 'Author 7',
        description: 'Description 7',
        categoryId: 2,
        price: 12.99,
        purchaseStock: 7,
        rentalStock: 3,
        available: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

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
      const emptyBook = {
        id: 999,
        title: '',
        author: '',
        description: null,
        categoryId: null,
        price: 0,
        purchaseStock: 0,
        rentalStock: 0,
        available: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.getById.mockResolvedValue(emptyBook);

      // Act
      const result = await useCase.execute(bookId);

      // Assert
      expect(mockRepository.getById).toHaveBeenCalledWith(bookId);
      expect(result).toEqual(emptyBook);
    });
  });
});
