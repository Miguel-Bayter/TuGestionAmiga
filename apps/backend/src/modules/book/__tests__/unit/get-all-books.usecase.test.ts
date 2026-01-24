import { GetAllBooksUseCase } from '../../application/use-case/get-all-books.usecase';
import type { IBookRepository } from '../../domain/interface/book.repository';

describe('GetAllBooksUseCase', () => {
  let useCase: GetAllBooksUseCase;
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
    useCase = new GetAllBooksUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should call repository.getAll() with no parameters when available is undefined', async () => {
      // Arrange
      const mockBooks = [
        {
          id: 1,
          title: 'Book 1',
          author: 'Author 1',
          description: 'Description for Book 1',
          categoryId: 1,
          price: 29.99,
          purchaseStock: 10,
          rentalStock: 5,
          available: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 2,
          title: 'Book 2',
          author: 'Author 2',
          description: 'Description for Book 2',
          categoryId: 2,
          price: 19.99,
          purchaseStock: 0,
          rentalStock: 0,
          available: false,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];
      mockRepository.getAll.mockResolvedValue(mockBooks);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(mockRepository.getAll).toHaveBeenCalledWith(undefined);
      expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBooks);
    });

    it('should call repository.getAll() with available=true filter', async () => {
      // Arrange
      const mockBooks = [
        {
          id: 1,
          title: 'Book 1',
          author: 'Author 1',
          description: 'Description for Book 1',
          categoryId: 1,
          price: 29.99,
          purchaseStock: 10,
          rentalStock: 5,
          available: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 3,
          title: 'Book 3',
          author: 'Author 3',
          description: 'Description for Book 3',
          categoryId: 1,
          price: 39.99,
          purchaseStock: 15,
          rentalStock: 8,
          available: true,
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03'),
        },
      ];
      mockRepository.getAll.mockResolvedValue(mockBooks);

      // Act
      const result = await useCase.execute(true);

      // Assert
      expect(mockRepository.getAll).toHaveBeenCalledWith(true);
      expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBooks);
    });

    it('should call repository.getAll() with available=false filter', async () => {
      // Arrange
      const mockBooks = [
        {
          id: 2,
          title: 'Book 2',
          author: 'Author 2',
          description: 'Description for Book 2',
          categoryId: 2,
          price: 19.99,
          purchaseStock: 0,
          rentalStock: 0,
          available: false,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];
      mockRepository.getAll.mockResolvedValue(mockBooks);

      // Act
      const result = await useCase.execute(false);

      // Assert
      expect(mockRepository.getAll).toHaveBeenCalledWith(false);
      expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBooks);
    });

    it('should return empty array when no books are found', async () => {
      // Arrange
      mockRepository.getAll.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(mockRepository.getAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([]);
    });

    it('should return repository results correctly', async () => {
      // Arrange
      const mockBooks = [
        {
          id: 1,
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          description: 'A classic American novel',
          categoryId: 1,
          price: 24.99,
          purchaseStock: 5,
          rentalStock: 3,
          available: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 2,
          title: '1984',
          author: 'George Orwell',
          description: 'A dystopian social science fiction novel',
          categoryId: 1,
          price: 22.99,
          purchaseStock: 3,
          rentalStock: 2,
          available: true,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];
      mockRepository.getAll.mockResolvedValue(mockBooks);

      // Act
      const result = await useCase.execute(true);

      // Assert
      expect(result).toEqual(mockBooks);
      expect(result).toHaveLength(2);
      expect((result[0] as Record<string, unknown>).title).toBe('The Great Gatsby');
      expect((result[1] as Record<string, unknown>).title).toBe('1984');
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockRepository.getAll.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow('Database connection failed');
      expect(mockRepository.getAll).toHaveBeenCalledWith(undefined);
    });

    it('should handle repository errors with available filter', async () => {
      // Arrange
      const error = new Error('Query execution failed');
      mockRepository.getAll.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(true)).rejects.toThrow('Query execution failed');
      expect(mockRepository.getAll).toHaveBeenCalledWith(true);
    });

    it('should not call other repository methods', async () => {
      // Arrange
      mockRepository.getAll.mockResolvedValue([]);

      // Act
      await useCase.execute();

      // Assert
      expect(mockRepository.getById).not.toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.update).not.toHaveBeenCalled();
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});
