-- #region database and use
CREATE DATABASE IF NOT EXISTS oaknglass
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_hungarian_ci;
USE oaknglass;
-- #endregion
-- #region users
CREATE TABLE IF NOT EXISTS users (
    UUID CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    FullName VARCHAR(255) NOT NULL,
    HashedFullName VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    HashedEmail VARCHAR(255) NOT NULL,
    VerifiedEmail BOOLEAN DEFAULT FALSE,
    MobileNumber VARCHAR(15) UNIQUE,
    HashedMobileNumber VARCHAR(255),
    HashedPassword VARCHAR(255) NOT NULL,
    Role ENUM('admin', 'user', 'journalist') DEFAULT 'user',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    BirthDate DATE NOT NULL,
    Address TEXT,
    EmailSubscribed BOOLEAN DEFAULT TRUE,
    INDEX idx_hashedemail (HashedEmail),
    INDEX idx_hashedmobilenumber (HashedMobileNumber)
);
-- #endregion
-- #region products, productImages
CREATE TABLE IF NOT EXISTS products (
    ProdID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL,
    AlcoholPercent FLOAT NOT NULL,
    ContentML INT NOT NULL,
    PriceHUF INT NOT NULL,
    Stock INT NOT NULL,
    CreatedBy CHAR(36) NOT NULL,
    INDEX idx_ProdID (ProdID),
    FOREIGN KEY (CreatedBy) REFERENCES users(UUID) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS productImages (
    ImageID INT PRIMARY KEY AUTO_INCREMENT,
    ProdID INT NOT NULL,
    FileName VARCHAR(255) NOT NULL,
    INDEX idx_ImageID (ImageID),
    FOREIGN KEY (ProdID) REFERENCES products(ProdID) ON DELETE CASCADE
);
-- #endregion
-- #region orders, orderItems
CREATE TABLE IF NOT EXISTS orders (
    OrderID INT PRIMARY KEY AUTO_INCREMENT,
    UserID CHAR(36) NOT NULL,
    TotalPriceHUF INT NOT NULL,
    ShipmentAddress TEXT NOT NULL,
    Status ENUM('pending', 'shipped', 'delivered', 'canceled') DEFAULT 'pending',
    OrderTimeStamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_OrderID (OrderID),
    FOREIGN KEY (UserID) REFERENCES users(UUID) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS orderItems (
    OrderItemID INT PRIMARY KEY AUTO_INCREMENT,
    OrderID INT NOT NULL,
    ProdID INT NOT NULL,
    Quantity INT NOT NULL,
    INDEX idx_OrderItemID (OrderItemID),
    FOREIGN KEY (OrderID) REFERENCES orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ProdID) REFERENCES products(ProdID) ON DELETE CASCADE
);
-- #endregion
-- #region sessions, emailCodes
CREATE TABLE IF NOT EXISTS sessions (
    SessionID INT PRIMARY KEY AUTO_INCREMENT,
    UserID CHAR(36) NOT NULL,
    RefreshToken VARCHAR(255) NOT NULL UNIQUE,
    ExpiresAt TIMESTAMP NOT NULL,
    INDEX idx_SessionID (SessionID),
    FOREIGN KEY (UserID) REFERENCES users(UUID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emailCodes (
    UserID CHAR(36) NOT NULL,
    HashedCode VARCHAR(255) NOT NULL,
    ExpiresAt TIMESTAMP NOT NULL,
    Type ENUM('verification', 'reset', 'cancel-order', 'delete-account', 'admin-invite', 'journalist-invite') NOT NULL,
    INDEX idx_UID (UserID),
    INDEX idx_hashedCode (HashedCode),
    FOREIGN KEY (UserID) REFERENCES users(UUID) ON DELETE CASCADE
);
-- #endregion
-- #region reviews
CREATE TABLE IF NOT EXISTS reviews (
    ReviewID INT PRIMARY KEY AUTO_INCREMENT,
    ProdID INT NOT NULL,
    UserID CHAR(36) NOT NULL,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ReviewID (ReviewID),
    FOREIGN KEY (ProdID) REFERENCES products(ProdID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES users(UUID) ON DELETE CASCADE
);
-- #endregion
-- #region Blogok
CREATE TABLE IF NOT EXISTS blogs (
    BlogID INT PRIMARY KEY AUTO_INCREMENT,
    Title VARCHAR(255) NOT NULL,
    Content TEXT NOT NULL,
    AuthorID CHAR(36) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ImageFileName VARCHAR(255),
    INDEX idx_BlogID (BlogID),
    FOREIGN KEY (AuthorID) REFERENCES users(UUID) ON DELETE SET NULL
);
-- #endregion
-- #region Ratings
CREATE TABLE IF NOT EXISTS ratings (
    RatingID INT PRIMARY KEY AUTO_INCREMENT,
    UserID CHAR(36) NOT NULL,
    Type ENUM('blog', 'review') NOT NULL,
    TargetID INT NOT NULL,
    Value INT NOT NULL CHECK (Value IN (1, -1)),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_RatingID (RatingID),
    FOREIGN KEY (UserID) REFERENCES users(UUID) ON DELETE CASCADE
);