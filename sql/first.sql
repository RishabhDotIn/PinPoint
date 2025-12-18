-- 1. DATABASE INITIALIZATION
[span_3](start_span)CREATE DATABASE Pinpoint;[span_3](end_span)
[span_4](start_span)USE Pinpoint;[span_4](end_span)

-- 2. TABLE DEFINITIONS (SCHEMA)
-[span_5](start_span)[span_6](start_span)- Stores user information[span_5](end_span)[span_6](end_span)
CREATE TABLE User (
    [span_7](start_span)user_id INT PRIMARY KEY AUTO_INCREMENT,[span_7](end_span)
    [span_8](start_span)full_name VARCHAR(255) NOT NULL,[span_8](end_span)
    [span_9](start_span)email VARCHAR(255) NOT NULL UNIQUE[span_9](end_span)
);

-[span_10](start_span)[span_11](start_span)- Stores lost/found item details[span_10](end_span)[span_11](end_span)
CREATE TABLE Item (
    [span_12](start_span)item_id INT PRIMARY KEY AUTO_INCREMENT,[span_12](end_span)
    [span_13](start_span)name VARCHAR(255) NOT NULL,[span_13](end_span)
    [span_14](start_span)description TEXT,[span_14](end_span)
    [span_15](start_span)photo_url VARCHAR(255),[span_15](end_span)
    [span_16](start_span)found_date DATE,[span_16](end_span)
    [span_17](start_span)is_delivered BOOLEAN DEFAULT 0,[span_17](end_span)
    [span_18](start_span)finder_id INT,[span_18](end_span)
    [span_19](start_span)FOREIGN KEY (finder_id) REFERENCES User(user_id)[span_19](end_span)
);

-[span_20](start_span)[span_21](start_span)- Stores geographical data for items[span_20](end_span)[span_21](end_span)
CREATE TABLE Location (
    [span_22](start_span)location_id INT PRIMARY KEY AUTO_INCREMENT,[span_22](end_span)
    [span_23](start_span)latitude DECIMAL(10, 8) NOT NULL,[span_23](end_span)
    [span_24](start_span)longitude DECIMAL(11, 8) NOT NULL,[span_24](end_span)
    [span_25](start_span)item_id INT,[span_25](end_span)
    [span_26](start_span)FOREIGN KEY (item_id) REFERENCES Item(item_id)[span_26](end_span)
);

-[span_27](start_span)[span_28](start_span)- Stores return history[span_27](end_span)[span_28](end_span)
CREATE TABLE Transaction (
    [span_29](start_span)transaction_id INT PRIMARY KEY AUTO_INCREMENT,[span_29](end_span)
    [span_30](start_span)delivery_date DATE NOT NULL,[span_30](end_span)
    [span_31](start_span)item_id INT,[span_31](end_span)
    [span_32](start_span)finder_id INT,[span_32](end_span)
    [span_33](start_span)receiver_id INT,[span_33](end_span)
    [span_34](start_span)FOREIGN KEY (item_id) REFERENCES Item(item_id),[span_34](end_span)
    [span_35](start_span)FOREIGN KEY (finder_id) REFERENCES User(user_id),[span_35](end_span)
    [span_36](start_span)FOREIGN KEY (receiver_id) REFERENCES User(user_id)[span_36](end_span)
);

-- 3. TRIGGER (Automatic status update)
DELIMITER //
CREATE TRIGGER after_transaction_insert
AFTER INSERT ON Transaction
FOR EACH ROW
BEGIN
    UPDATE Item 
    SET is_delivered = 1 
    WHERE item_id = NEW.item_id;
END; //
DELIMITER ;

-[span_37](start_span)- 4. VIEW FOR ADMIN REPORTS[span_37](end_span)
CREATE VIEW Delivered_Items_Report AS
SELECT 
    I.item_id, 
    I.name AS Item_Name, 
    U.full_name AS Finder_Name, 
    T.delivery_date
FROM Item I
JOIN User U ON I.finder_id = U.user_id
JOIN Transaction T ON I.item_id = T.item_id
[span_38](start_span)WHERE I.is_delivered = 1;[span_38](end_span)

-- 5. SAMPLE TEST DATA (DML)
[span_39](start_span)INSERT INTO User (user_id, full_name, email) VALUES (101, 'Amit Sharma', 'amit.sharma@mail.edu');[span_39](end_span)
[span_40](start_span)INSERT INTO User (user_id, full_name, email) VALUES (102, 'Pooja Singh', 'pooja.singh@mail.edu');[span_40](end_span)

INSERT INTO Item (item_id, name, description, photo_url, found_date, is_delivered, finder_id) 
[span_41](start_span)[span_42](start_span)VALUES (201, 'Black Wallet', 'Found near the library entrance.', 'url_1', '2025-10-15', 0, 101);[span_41](end_span)[span_42](end_span)

INSERT INTO Location (location_id, latitude, longitude, item_id) 
[span_43](start_span)[span_44](start_span)VALUES (401, 34.05000000, -118.05000000, 201);[span_43](end_span)[span_44](end_span)
