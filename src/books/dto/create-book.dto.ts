export class CreateBookDto {
  title!: string;
  isbn!: string;

  description?: string;
  purchasePrice!: number;
  rentPrice!: number;
  stockCount!: number;
  authorId!: string;
  categoryId!: string;
}
