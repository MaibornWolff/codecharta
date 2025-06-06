#get the username from a prompt
username = raw_input("Login: >> ")

#list of allowed users
user1 = "Jack"
user2 = "Jill"

#control that the user belongs to the list of allowed users
if username == user1:
    print "Access granted"
elif username == user2:
    print "Welcome to the system"
else:
    print "Access denied"