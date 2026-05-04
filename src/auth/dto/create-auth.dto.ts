/**
 * model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  phone     String?
  role      Role     @default(STUDENT) // Default role is Student

  // Relations
  sessions     Session[]
  // Transactions made by the student
  transactions Transaction[] @relation("StudentTransactions") 
  // Transactions handled/approved by a seller or admin
  processed    Transaction[] @relation("ProcessedTransactions") 
  authors       Author?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// 3. Active Session Tracking (Device & IP)
model Session {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  deviceOs    String?  
  browser     String?  
  ipAddress   String?  
  lastActive  DateTime @default(now())
  createdAt   DateTime @default(now())
}

// 4. Core Library Models
model Author {
  id        String   @id @default(uuid())
  userId    String @unique
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  status    AuthorStatus @default(PENDING)
  name      String
  bio       String?
  books     Book[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

 */

export class CreateAuthDto {}

export class RegisterAuthDto {
  email!: string;
  password!: string;
  name!: string;
  phone?: string;
  role?: 'STUDENT' | 'SELLER' | 'ADMIN';
}

export class LoginAuthDto {
  email!: string;
  password!: string;
  deviceOs?: string;
  browser?: string;
  ipAddress?: string;
  location?: string;
}

export class AuthorDto {
  name!: string;
  bio?: string;
}
