class Phone:
    def __init__(self, phone_number):
        self.phone_number = phone_number
        self.call_history = []
        self.messages = []

    # Make a call
    def call(self, other_phone):
        call = f"{self.phone_number} called {other_phone.phone_number}"
        print(call)
        self.call_history.append(call)

    # Show call history
    def show_call_history(self):
        print(self.call_history)

    # Send a message
    def send_message(self, other_phone, content):
        message = {
            "to": other_phone.phone_number,
            "from": self.phone_number,
            "content": content
        }

        # Save message for both phones
        self.messages.append(message)
        other_phone.messages.append(message)

    # Show outgoing messages
    def show_outgoing_messages(self):
        for message in self.messages:
            if message["from"] == self.phone_number:
                print(message)

    # Show incoming messages
    def show_incoming_messages(self):
        for message in self.messages:
            if message["to"] == self.phone_number:
                print(message)

    # Show messages from another phone
    def show_messages_from(self, other_phone):
        for message in self.messages:
            if message["from"] == other_phone.phone_number:
                print(message)


# -------------------------
# TESTING
# -------------------------

phone1 = Phone("0712345678")
phone2 = Phone("0798765432")

# Test calls
phone1.call(phone2)
phone2.call(phone1)

print("\nPhone 1 call history:")
phone1.show_call_history()

print("\nPhone 2 call history:")
phone2.show_call_history()


# Test messages
phone1.send_message(phone2, "Hello, how are you?")
phone2.send_message(phone1, "I'm fine, thank you!")
phone1.send_message(phone2, "That's great!")


print("\nPhone 1 outgoing messages:")
phone1.show_outgoing_messages()

print("\nPhone 1 incoming messages:")
phone1.show_incoming_messages()

print("\nMessages from Phone 2:")
phone1.show_messages_from(phone2)

print("\nPhone 2 outgoing messages:")
phone2.show_outgoing_messages()

print("\nPhone 2 incoming messages:")
phone2.show_incoming_messages()