# This is a generated sample file for analysis only

# An interface representing a user in the system
class User
    attr_accessor :id, :name, :email, :role, :is_active

    def initialize(id:, name:, email:, role:, is_active:)
        @id = id
        @name = name
        @email = email
        @role = role # 'admin', 'user', or 'guest'
        @is_active = is_active
    end
end

# Data validation utility functions
class Validator
    # Validates an email address format
    def self.valid_email?(email)
        email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        !!(email =~ email_regex)
    end

    # Validates a password meets requirements
    def self.strong_password?(password)
        return false if password.length < 8
        return false unless password =~ /[A-Z]/
        return false unless password =~ /[a-z]/
        return false unless password =~ /[0-9]/
        return false unless password =~ /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
        true
    end
end

# User management service class
class UserService
    def initialize
        @users = []
        @next_id = 1
    end

    # Creates a new user in the system
    def create_user(name, email, role = 'user')
        # Validate inputs
        if name.nil? || name.strip.empty?
            puts 'Name is required'
            return nil
        end

        unless Validator.valid_email?(email)
            puts 'Invalid email format'
            return nil
        end

        # Check if user with email already exists
        if get_user_by_email(email)
            puts 'User with this email already exists'
            return nil
        end

        # Create new user
        new_user = User.new(
            id: @next_id,
            name: name.strip,
            email: email.downcase,
            role: role,
            is_active: true
        )
        @next_id += 1
        @users << new_user
        new_user
    end

    # Updates user information
    def update_user(id, updates = {})
        index = @users.find_index { |user| user.id == id }
        return nil if index.nil?

        # Validate email if it's being updated
        if updates[:email] && !Validator.valid_email?(updates[:email])
            puts 'Invalid email format'
            return nil
        end

        user = @users[index]
        updates.each do |key, value|
            user.send("#{key}=", value) if user.respond_to?("#{key}=")
        end
        user
    end

    # Find user by email (case insensitive)
    def get_user_by_email(email)
        @users.find { |user| user.email.downcase == email.downcase }
    end

    # Method with high cyclomatic complexity for determining user access level
    # Returns access level from 0 (no access) to 3 (full access)
    def determine_access_level(user, resource)
        # No access for inactive users
        return 0 unless user.is_active

        # Admin has full access to everything
        return 3 if user.role == 'admin'

        # Special resource handling
        if resource.start_with?('personal-')
            resource_owner_id = resource.split('-')[1].to_i
            return user.id == resource_owner_id ? 2 : 0
        elsif resource.start_with?('team-')
            return 2 if user.role == 'user'
            return 1 if user.role == 'guest'
        elsif resource == 'public'
            return 1
        end

        # Default access level
        user.role == 'guest' ? 0 : 1
    end
end

# Usage example
user_service = UserService.new
admin = user_service.create_user('Admin User', 'admin@example.com', 'admin')
regular_user = user_service.create_user('Regular User', 'user@example.com', 'user')
guest = user_service.create_user('Guest User', 'guest@example.com', 'guest')

# Example access level checks
if admin
    puts "Admin access level to team resource: #{user_service.determine_access_level(admin, 'team-finance')}"
end

if regular_user
    puts "Regular user access level to personal resource: #{user_service.determine_access_level(regular_user, "personal-#{regular_user.id}")}"
end

if guest
    puts "Guest access level to public resource: #{user_service.determine_access_level(guest, 'public')}"
end
