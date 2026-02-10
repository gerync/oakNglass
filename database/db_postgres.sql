-- PostgreSQL DB

-- #region create DB
CREATE DATABASE IF NOT EXISTS oaknglass;
\c oaknglass;
-- #endregion
-- #region users
CREATE TABLE IF NOT EXISTS Users (
    UUID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    FullNameEnc BYTEA NOT NULL,
    HashedFullName VARCHAR(255) NOT NULL,
    EmailEnc BYTEA NOT NULL UNIQUE,
    HashedEmail VARCHAR(255) NOT NULL,
    VerifiedEmail BOOLEAN DEFAULT FALSE,
    MobileNumberEnc BYTEA UNIQUE,
    HashedMobileNumber VARCHAR(255),
    HashedPassword VARCHAR(255) NOT NULL,
    Role VARCHAR(20) CHECK (Role IN ('admin', 'user', 'journalist')) DEFAULT 'user',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    BirthDate DATE NOT NULL,
    AddressEnc BYTEA,
    EmailSubscribed BOOLEAN DEFAULT false,
    INDEX idx_hashedemail (HashedEmail),
    INDEX idx_hashedmobilenumber (HashedMobileNumber),
    INDEX idx_uuid (UUID)
);
-- #endregion
-- #region EmailCodes
CREATE TABLE IF NOT EXISTS EmailCodes (
    UserID UUID NOT NULL,
    HashedCode VARCHAR(255) NOT NULL,
    ExpiresAt TIMESTAMP NOT NULL,
    Type VARCHAR(20) CHECK (Type IN ('verification', 'reset', 'cancel-order', 'delete-account', 'admin-invite', 'journalist-invite')) NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UUID) ON DELETE CASCADE,
    INDEX idx_userid (UserID),
    INDEX idx_hashedcode (HashedCode)
);
-- #endregion
-- #region products, productImages
CREATE TABLE IF NOT EXISTS Products (
    ProdID SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    AlcoholPercent FLOAT NOT NULL,
    ContentML INT NOT NULL,
    PriceHUF INT NOT NULL,
    Stock INT NOT NULL,
    CreatedBy UUID NOT NULL,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UUID) ON DELETE SET NULL,
    INDEX idx_ProdID (ProdID)
);
CREATE TABLE IF NOT EXISTS ProductImages (
    ID VARCHAR(255) PRIMARY KEY,
    ProdID INT NOT NULL,
    FOREIGN KEY (ProdID) REFERENCES Products(ProdID) ON DELETE CASCADE,
    INDEX idx_ImageID (ImageID)
);
-- #endregion
-- #region orders, orderItems
CREATE TABLE IF NOT EXISTS Orders (
    OrderID SERIAL PRIMARY KEY,
    UserID UUID NOT NULL,
    TotalPriceHUF INT NOT NULL,
    ShipmentAddress TEXT NOT NULL,
    Status VARCHAR(20) CHECK (Status IN ('pending', 'shipped', 'delivered', 'canceled')) DEFAULT 'pending',
    OrderTimeStamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UUID) ON DELETE CASCADE,
    INDEX idx_OrderID (OrderID),
    INDEX idx_userid (UserID)
);
CREATE TABLE IF NOT EXISTS OrderItems (
    OrderItemID SERIAL PRIMARY KEY,
    OrderID INT NOT NULL,
    ProdID INT NOT NULL,
    Quantity INT NOT NULL,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ProdID) REFERENCES Products(ProdID) ON DELETE CASCADE,
    INDEX idx_OrderItemID (OrderItemID)
);
-- #endregion
-- #region reviews
CREATE TABLE IF NOT EXISTS Reviews (
    ReviewID SERIAL PRIMARY KEY,
    UserID UUID NOT NULL,
    ProdID INT NOT NULL,
    Rating INT CHECK (Rating >= 1 AND Rating <= 5) NOT NULL,
    Comment TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UUID) ON DELETE CASCADE,
    FOREIGN KEY (ProdID) REFERENCES Products(ProdID) ON DELETE CASCADE,
    INDEX idx_ReviewID (ReviewID),
    INDEX idx_prodid (ProdID)
);
-- #endregion
-- #region RefreshTokens
CREATE TABLE IF NOT EXISTS RefreshTokens (
    TokenID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserID UUID NOT NULL,
    AccessVersion INT NOT NULL DEFAULT 1,
    ExpiresAt TIMESTAMP NOT NULL,
    Revoked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (UserID) REFERENCES Users(UUID) ON DELETE CASCADE,
    INDEX idx_TokenID (TokenID),
    INDEX idx_token (TokenHash)
);
-- #endregion
-- #region Blogs
CREATE TABLE IF NOT EXISTS Blogs (
    BlogID SERIAL PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Content TEXT NOT NULL,
    JournalistUUID UUID NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (JournalistUUID) REFERENCES Users(UUID) ON DELETE SET NULL,
    INDEX idx_BlogID (BlogID),
    INDEX idx_journalistuuid (JournalistUUID)
);
-- #endregion
-- #region Ratings
CREATE TABLE IF NOT EXISTS Ratings (
    RatingID SERIAL PRIMARY KEY,
    UserID UUID NOT NULL,
    ReviewID INT NOT NULL,
    Positive BOOLEAN NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UUID) ON DELETE CASCADE,
    FOREIGN KEY (ReviewID) REFERENCES Reviews(ReviewID) ON DELETE CASCADE,
    INDEX idx_RatingID (RatingID),
    INDEX idx_reviewid (ReviewID)
);
-- #endregion