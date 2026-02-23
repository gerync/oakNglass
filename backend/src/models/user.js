class User {
    constructor(UUID, HashedFullName, FullNameEnc, EmailEnc, HashedEmail, MobileEnc, HashedMobile, HashedPassword, 
        Birthdate, CreatedAt, AddressEnc, Role, EmailSubscribed) {
        this.uuid = UUID;
        this.hashedFullName = HashedFullName;
        this.fullNameEnc = FullNameEnc;
        this.emailEnc = EmailEnc;
        this.hashedEmail = HashedEmail;
        this.mobileEnc = MobileEnc;
        this.hashedMobile = HashedMobile;
        this.hashedPassword = HashedPassword;
        this.birthdate = Birthdate;
        this.createdAt = CreatedAt;
        this.addressEnc = AddressEnc;
        this.role = Role;
        this.emailSubscribed = EmailSubscribed;
    }
}

class UserTemp {
    constructor(FullName, Email, Mobile, Password, Birthdate, Address) {
        this.fullName = FullName;
        this.email = Email;
        this.mobile = Mobile;
        this.password = Password;
        this.birthdate = Birthdate;
        this.address = Address;
    }
}

export default { User, UserTemp };
export { User, UserTemp };