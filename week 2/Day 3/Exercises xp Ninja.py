class Temperature:
    def __init__(self, value):
        self.value = value

    def __repr__(self):
        return f"{self.__class__.__name__}({self.value})"


class Celsius(Temperature):
    def to_celsius(self):
        return Celsius(self.value)

    def to_kelvin(self):
        return Kelvin(self.value + 273.15)

    def to_fahrenheit(self):
        return Fahrenheit((self.value * 9 / 5) + 32)


class Kelvin(Temperature):
    def to_celsius(self):
        return Celsius(self.value - 273.15)

    def to_kelvin(self):
        return Kelvin(self.value)

    def to_fahrenheit(self):
        return Fahrenheit((self.value - 273.15) * 9 / 5 + 32)


class Fahrenheit(Temperature):
    def to_celsius(self):
        return Celsius((self.value - 32) * 5 / 9)

    def to_kelvin(self):
        return Kelvin((self.value - 32) * 5 / 9 + 273.15)

    def to_fahrenheit(self):
        return Fahrenheit(self.value)


# Tests
celsius = Celsius(25)

print(celsius.to_kelvin())
print(celsius.to_fahrenheit())

fahrenheit = Fahrenheit(77)

print(fahrenheit.to_celsius())
print(fahrenheit.to_kelvin())

kelvin = Kelvin(300)

print(kelvin.to_celsius())
print(kelvin.to_fahrenheit())

import random


class QuantumParticle:

    def __init__(self, x=None, p=None):
        self._position = x if x is not None else random.randint(1, 10000)
        self._momentum = p if p is not None else random.uniform(0, 1)
        self._spin = random.choice([0.5, -0.5])

        self._entangled_particle = None

    def position(self):
        result = self._position

        self._disturbance()

        return result

    def momentum(self):
        result = self._momentum

        self._disturbance()

        return result

    def spin(self):
        result = self._spin

        # If this particle is entangled,
        # the other particle gets the opposite spin.
        if self._entangled_particle is not None:
            self._entangled_particle._spin = -result

        self._disturbance()

        return result

    def _disturbance(self):
        self._position = random.randint(1, 10000)
        self._momentum = random.uniform(0, 1)

        print("Quantum Interferences!!")

    def entangle(self, particle):
        if not isinstance(particle, QuantumParticle):
            raise TypeError(
                "A quantum particle can only be entangled "
                "with another QuantumParticle."
            )

        self._entangled_particle = particle
        particle._entangled_particle = self

        print("Spooky Action at a Distance !!")

    def __repr__(self):
        return (
            f"QuantumParticle("
            f"position={self._position}, "
            f"momentum={self._momentum}, "
            f"spin={self._spin})"
        )


# Tests
p1 = QuantumParticle(x=1, p=5.0)
p2 = QuantumParticle(x=2, p=5.0)

print(p1)
print(p2)

p1.entangle(p2)

print("P1 spin:", p1.spin())
print("P2 spin:", p2._spin)

print(p1)
print(p2)


# Test invalid entanglement
try:
    p1.entangle("hello")
except TypeError as error:
    print(error)


p1 = QuantumParticle(x=1, p=5.0)
p2 = QuantumParticle(x=2, p=5.0)

p1.entangle(p2)



p1.spin()
