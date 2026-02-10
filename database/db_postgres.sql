-- PostgreSQL DB

-- #region create DB
-- Ensure extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- #endregion
-- #region users
CREATE TABLE Users (
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
    EmailSubscribed BOOLEAN DEFAULT false
);
CREATE INDEX idx_users_email ON Users(HashedEmail);
CREATE INDEX idx_users_mobile ON Users(MobileNumberEnc);
CREATE INDEX idx_uuid ON Users(UUID);
-- #endregion
-- #region EmailCodes
CREATE TABLE EmailCodes (
    UserID UUID NOT NULL,
    HashedCode VARCHAR(255) NOT NULL,
    ExpiresAt TIMESTAMP NOT NULL,
    Type VARCHAR(20) CHECK (Type IN ('verification', 'reset', 'cancel-order', 'delete-account', 'admin-invite', 'journalist-invite')) NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UUID) ON DELETE CASCADE
);
CREATE INDEX idx_emailcodes_userid ON EmailCodes(UserID);
CREATE INDEX idx_emailcodes_code ON EmailCodes(HashedCode);
-- #endregion
-- #region products, productImages
CREATE TABLE Products (
    ProdID SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    AlcoholPercent FLOAT NOT NULL,
    ContentML INT NOT NULL,
    PriceHUF INT NOT NULL,
    Stock INT NOT NULL,
    CreatedBy UUID,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UUID) ON DELETE SET NULL
);
CREATE INDEX idx_ProdID ON Products(ProdID);
CREATE TABLE ProductImages (
    ID VARCHAR(255) PRIMARY KEY,
    ProdID INT NOT NULL,
    FOREIGN KEY (ProdID) REFERENCES Products(ProdID) ON DELETE CASCADE
);
CREATE INDEX idx_ProductImages_ProdID ON ProductImages(ProdID);
CREATE INDEX idx_ProductImages_ID ON ProductImages(ID);
-- #endregion
-- #region orders, orderItems
CREATE TABLE Orders (
    OrderID SERIAL PRIMARY KEY,
    UserID UUID NOT NULL,
    TotalPriceHUF INT NOT NULL,
    ShipmentAddress TEXT NOT NULL,
    Status VARCHAR(20) CHECK (Status IN ('pending', 'shipped', 'delivered', 'canceled')) DEFAULT 'pending',
    OrderTimeStamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UUID) ON DELETE CASCADE
);
CREATE INDEX idx_OrderID ON Orders(OrderID);
CREATE INDEX idx_userid ON Orders(UserID);
CREATE TABLE OrderItems (
    OrderItemID SERIAL PRIMARY KEY,
    OrderID INT NOT NULL,
    ProdID INT NOT NULL,
    Quantity INT NOT NULL,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ProdID) REFERENCES Products(ProdID) ON DELETE CASCADE
);
CREATE INDEX idx_OrderItemID ON OrderItems(OrderItemID);
-- #endregion
-- #region reviews
CREATE TABLE Reviews (
    ReviewID SERIAL PRIMARY KEY,
    UserID UUID NOT NULL,
    ProdID INT NOT NULL,
    Rating INT CHECK (Rating >= 1 AND Rating <= 5) NOT NULL,
    Comment TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UUID) ON DELETE CASCADE,
    FOREIGN KEY (ProdID) REFERENCES Products(ProdID) ON DELETE CASCADE
);
CREATE INDEX idx_ReviewID ON Reviews(ReviewID);
CREATE INDEX idx_prodid ON Reviews(ProdID);
-- #endregion
-- #region RefreshTokens
CREATE TABLE RefreshTokens (
    TokenID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserID UUID NOT NULL,
    AccessVersion INT NOT NULL DEFAULT 1,
    ExpiresAt TIMESTAMP NOT NULL,
    Revoked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (UserID) REFERENCES Users(UUID) ON DELETE CASCADE
);
CREATE INDEX idx_TokenID ON RefreshTokens(TokenID);
CREATE INDEX idx_user ON RefreshTokens(UserID);
-- #endregion
-- #region Blogs
CREATE TABLE Blogs (
    BlogID SERIAL PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Content TEXT NOT NULL,
    JournalistUUID UUID NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (JournalistUUID) REFERENCES Users(UUID) ON DELETE SET NULL
);
CREATE INDEX idx_BlogID ON Blogs(BlogID);
CREATE INDEX idx_journalistuuid ON Blogs(JournalistUUID);
-- #endregion
-- #region Ratings
CREATE TABLE Ratings (
    RatingID SERIAL PRIMARY KEY,
    UserID UUID NOT NULL,
    ReviewID INT NOT NULL,
    Positive BOOLEAN NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UUID) ON DELETE CASCADE,
    FOREIGN KEY (ReviewID) REFERENCES Reviews(ReviewID) ON DELETE CASCADE
);
CREATE INDEX idx_RatingID ON Ratings(RatingID);
CREATE INDEX idx_reviewid ON Ratings(ReviewID);
-- #endregion