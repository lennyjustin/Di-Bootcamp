import math


class Circle:
    def __init__(self, radius=None, diameter=None):
        if radius is not None and diameter is not None:
            raise ValueError("Choose either radius or diameter, not both.")

        if radius is not None:
            self.radius = radius
        elif diameter is not None:
            self.radius = diameter / 2
        else:
            raise ValueError("You must provide a radius or diameter.")

        if self.radius < 0:
            raise ValueError("Radius cannot be negative.")

    # Decorator: allows us to use circle.diameter
    @property
    def diameter(self):
        return self.radius * 2

    @diameter.setter
    def diameter(self, value):
        if value < 0:
            raise ValueError("Diameter cannot be negative.")
        self.radius = value / 2

    # Calculate area
    @property
    def area(self):
        return math.pi * self.radius ** 2

    # Print circle information
    def __str__(self):
        return f"Circle with radius {self.radius} and diameter {self.diameter}"

    def __repr__(self):
        return f"Circle(radius={self.radius})"

    # Add two circles
    def __add__(self, other):
        if not isinstance(other, Circle):
            return NotImplemented

        return Circle(self.radius + other.radius)

    # Check if one circle is bigger
    def __gt__(self, other):
        if not isinstance(other, Circle):
            return NotImplemented

        return self.radius > other.radius

    # Check if two circles are equal
    def __eq__(self, other):
        if not isinstance(other, Circle):
            return NotImplemented

        return self.radius == other.radius

    # Allow circles to be sorted
    def __lt__(self, other):
        if not isinstance(other, Circle):
            return NotImplemented

        return self.radius < other.radius


# -------------------------
# TESTING
# -------------------------

circle1 = Circle(radius=5)
circle2 = Circle(diameter=10)
circle3 = Circle(radius=3)
circle4 = Circle(radius=8)

# Print circles
print(circle1)
print(circle2)

# Radius and diameter
print("Radius:", circle1.radius)
print("Diameter:", circle1.diameter)

# Area
print("Area:", circle1.area)

# Compare circles
print("circle1 > circle3:", circle1 > circle3)
print("circle1 == circle2:", circle1 == circle2)

# Add circles
circle5 = circle1 + circle3
print("circle1 + circle3:", circle5)

# Sort circles
circles = [circle1, circle2, circle3, circle4, circle5]

circles.sort()

print("\nSorted circles:")
for circle in circles:
    print(circle)