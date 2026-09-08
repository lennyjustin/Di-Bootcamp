"""SkyCast desktop weather application."""

# Get an API key: https://home.openweathermap.org/users/sign_up
# PowerShell: $env:OPENWEATHER_API_KEY = "your_actual_api_key"

import os
import tkinter as tk
import webbrowser
from collections import defaultdict
from datetime import datetime
from tkinter import messagebox, ttk

import pytz
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure
from pyowm.owm import OWM

METEOBLUE_PARIS_URL = (
	"https://www.meteoblue.com/en/weather/week/paris_france_2988507"
)
OPENWEATHER_SIGNUP_URL = "https://home.openweathermap.org/users/sign_up"

def init_plot(axis):
	axis.set_title("Three-Day Humidity Forecast", fontsize=15, fontweight="bold")
	axis.set_ylabel("Humidity (%)", fontsize=11, fontweight="bold")
	axis.set_ylim(0, 100)
	axis.set_axisbelow(True)
	axis.grid(axis="y", linestyle="--", linewidth=0.8, alpha=0.3)
	axis.set_facecolor("#F8FBFF")
	axis.spines["top"].set_visible(False)
	axis.spines["right"].set_visible(False)


def plot_temperatures(axis, dates, humidity_values):
	"""Plot humidity values using the challenge's requested function name."""
	return axis.bar(
		dates,
		humidity_values,
		width=0.58,
		color="#38BDF8",
		edgecolor="#0284C7",
		linewidth=1.2,
	)


def write_humidity_on_bar_chart(axis, bars, humidity_values):
	for bar, humidity in zip(bars, humidity_values):
		axis.text(
			bar.get_x() + bar.get_width() / 2,
			bar.get_height() + 2,
			f"{humidity:.0f}%",
			ha="center",
			va="bottom",
			fontweight="bold",
			color="#0369A1",
		)


class WeatherApp:
	def __init__(self, root):
		self.root = root
		self.root.title("SkyCast Weather App")
		self.root.geometry("1120x760")
		self.root.minsize(850, 650)
		self.root.configure(bg="#EAF4FF")

		api_key = os.getenv("OPENWEATHER_API_KEY")
		if not api_key:
			messagebox.showerror(
				"Missing API key",
				"Set OPENWEATHER_API_KEY before starting the application.",
			)
			self.root.destroy()
			return

		self.owm = OWM(api_key)
		self.weather_manager = self.owm.weather_manager()
		self.registry = self.owm.city_id_registry()
		self.air_manager = self.owm.airpollution_manager()
		self.timezone_offset = 0
		self.create_styles()
		self.create_interface()
		self.city_entry.insert(0, "Paris, FR")

	def create_styles(self):
		style = ttk.Style()
		style.theme_use("clam")
		style.configure("Title.TLabel", background="#EAF4FF", foreground="#172033", font=("Arial", 24, "bold"))
		style.configure("Subtitle.TLabel", background="#EAF4FF", foreground="#64748B", font=("Arial", 11))
		style.configure("Primary.TButton", background="#2563EB", foreground="white", font=("Arial", 11, "bold"), padding=(16, 9))

	def create_interface(self):
		header = ttk.Frame(self.root)
		header.pack(fill="x", padx=30, pady=(22, 10))
		ttk.Label(header, text="SkyCast", style="Title.TLabel").pack(side="left")
		ttk.Label(header, text="Weather information made simple", style="Subtitle.TLabel").pack(side="left", padx=18, pady=(8, 0))

		search = tk.Frame(self.root, bg="white", highlightbackground="#D9E5F2", highlightthickness=1)
		search.pack(fill="x", padx=30, pady=10)
		self.city_entry = ttk.Entry(search, font=("Arial", 13))
		self.city_entry.pack(side="left", fill="x", expand=True, padx=14, pady=12)
		self.city_entry.bind("<Return>", lambda event: self.load_weather())
		ttk.Button(search, text="Search", style="Primary.TButton", command=self.load_weather).pack(side="right", padx=10, pady=7)
		ttk.Button(
			search,
			text="Open Meteoblue Paris",
			command=lambda: webbrowser.open(METEOBLUE_PARIS_URL),
		).pack(side="right", padx=(0, 10), pady=7)
		tk.Button(
			search,
			text="OpenWeather API",
			command=lambda: webbrowser.open(OPENWEATHER_SIGNUP_URL),
		).pack(side="right", padx=(0, 10), pady=7)

		self.status_label = ttk.Label(self.root, text="", style="Subtitle.TLabel")
		self.status_label.pack(anchor="w", padx=32, pady=(0, 8))
		self.content = tk.Frame(self.root, bg="#EAF4FF")
		self.content.pack(fill="both", expand=True, padx=30, pady=5)
		self.left_panel = tk.Frame(self.content, bg="#EAF4FF", width=330)
		self.left_panel.pack(side="left", fill="y", padx=(0, 15))
		self.right_panel = tk.Frame(self.content, bg="white", highlightbackground="#D9E5F2", highlightthickness=1)
		self.right_panel.pack(side="right", fill="both", expand=True)

		self.location_label = ttk.Label(self.left_panel, text="Location", style="Title.TLabel", wraplength=310)
		self.location_label.pack(anchor="w", pady=(5, 0))
		self.date_label = ttk.Label(self.left_panel, text="", style="Subtitle.TLabel")
		self.date_label.pack(anchor="w", pady=(2, 18))
		self.temperature_label = tk.Label(self.left_panel, text="-- C", bg="#EAF4FF", fg="#172033", font=("Arial", 45, "bold"))
		self.temperature_label.pack(anchor="w")
		self.condition_label = tk.Label(self.left_panel, text="", bg="#EAF4FF", fg="#64748B", font=("Arial", 13))
		self.condition_label.pack(anchor="w", pady=(0, 18))
		self.details_label = tk.Label(self.left_panel, text="", justify="left", anchor="w", bg="white", fg="#334155", font=("Arial", 11), padx=18, pady=16)
		self.details_label.pack(fill="x", pady=(0, 14))
		self.sun_label = tk.Label(self.left_panel, text="", justify="left", anchor="w", bg="white", fg="#334155", font=("Arial", 11), padx=18, pady=16)
		self.sun_label.pack(fill="x")

		tk.Label(self.right_panel, text="Humidity forecast", bg="white", fg="#172033", font=("Arial", 18, "bold")).pack(anchor="w", padx=22, pady=(18, 0))
		self.figure = Figure(figsize=(7.2, 4.5), dpi=100, facecolor="white")
		self.axis = self.figure.add_subplot(111)
		init_plot(self.axis)
		self.canvas = FigureCanvasTkAgg(self.figure, master=self.right_panel)
		self.canvas.get_tk_widget().pack(fill="both", expand=True, padx=12, pady=15)
		tk.Label(self.right_panel, text="Three-hour forecast", bg="white", fg="#172033", font=("Arial", 16, "bold")).pack(anchor="w", padx=22)
		self.forecast_text = tk.Label(self.right_panel, text="", bg="white", fg="#475569", justify="left", anchor="w", padx=22, pady=8)
		self.forecast_text.pack(fill="x")

	def local_datetime(self, value):
		if value.tzinfo is None:
			value = pytz.UTC.localize(value)
		return value.astimezone(pytz.FixedOffset(self.timezone_offset // 60))

	def search_city(self, query):
		pieces = [part.strip() for part in query.strip().split(",")]
		if not pieces[0]:
			raise ValueError("Enter a city name.")
		if len(pieces) > 1 and len(pieces[1]) == 2:
			results = self.registry.ids_for(pieces[0], country=pieces[1].upper(), matching="exact")
		else:
			results = self.registry.ids_for(query.strip(), matching="like")
		if not results:
			raise ValueError("Location not found. Try a city and country, for example Paris, FR.")
		return results[0]

	def load_weather(self):
		self.status_label.config(text="Loading weather data...")
		self.root.update_idletasks()
		try:
			city_id, city_name, country, state, latitude, longitude = self.search_city(self.city_entry.get())
			weather = self.weather_manager.weather_at_id(int(city_id)).weather
			self.timezone_offset = int(getattr(weather, "timezone", 0) or 0)
			temperature = weather.temperature("celsius")
			wind = weather.wind(unit="meters_sec")
			pressure = weather.barometric_pressure()
			self.location_label.config(text=f"{city_name}, {country}")
			self.date_label.config(text=datetime.now().strftime("%A, %d %B %Y"))
			self.temperature_label.config(text=f"{temperature.get('temp', 0):.0f} C")
			self.condition_label.config(text=weather.detailed_status.title())
			self.details_label.config(text=(f"Wind: {wind.get('speed', 0):.1f} m/s\n" f"Direction: {wind.get('deg', 'N/A')} degrees\n" f"Humidity: {weather.humidity}%\n" f"Pressure: {pressure.get('press', 'N/A')} hPa\n" f"Clouds: {weather.clouds}%"))
			sunrise = self.local_datetime(weather.sunrise_time(timeformat="date")).strftime("%H:%M")
			sunset = self.local_datetime(weather.sunset_time(timeformat="date")).strftime("%H:%M")
			self.sun_label.config(text=f"Sunrise: {sunrise}\nSunset: {sunset}")
			forecast = self.weather_manager.forecast_at_coords(lat=latitude, lon=longitude, interval="3h").forecast
			self.display_forecast(forecast.weathers)
			self.display_humidity_chart(forecast.weathers)
			self.display_air_pollution(latitude, longitude)
			self.status_label.config(text=f"Updated successfully - City ID: {city_id}")
		except Exception as error:
			self.status_label.config(text="Unable to load weather data.")
			messagebox.showerror("Weather error", str(error))

	def display_forecast(self, forecast_items):
		rows = []
		for item in list(forecast_items)[:10]:
			local_time = self.local_datetime(item.get_reference_time(timeformat="date"))
			rows.append(f"{local_time.strftime('%a %H:%M')}   {item.temperature('celsius').get('temp', 0):.0f} C   {item.humidity}% humidity   {item.status}")
		self.forecast_text.config(text="\n".join(rows))

	def display_humidity_chart(self, forecast_items):
		grouped = defaultdict(list)
		for item in forecast_items:
			grouped[self.local_datetime(item.get_reference_time(timeformat="date")).date()].append(item.humidity)
		days = sorted(grouped)[:3]
		if not days:
			return
		labels = [day.strftime("%a\n%d %b") for day in days]
		values = [sum(grouped[day]) / len(grouped[day]) for day in days]
		self.axis.clear()
		init_plot(self.axis)
		bars = plot_temperatures(self.axis, labels, values)
		write_humidity_on_bar_chart(self.axis, bars, values)
		self.figure.tight_layout()
		self.canvas.draw()

	def display_air_pollution(self, latitude, longitude):
		co_index = self.air_manager.coindex_around_coords(latitude, longitude)
		ozone = self.air_manager.ozone_around_coords(latitude, longitude)
		co_sample = co_index.get_co_sample_with_highest_vmr()
		co_value = getattr(co_sample, "vmr", "N/A")
		ozone_value = ozone.get_du_value()
		current = self.details_label.cget("text")
		air_text = (
			f"{current}\n\n"
			f"Carbon monoxide VMR: {co_value}\n"
			f"Ozone: {ozone_value} Dobson Units"
		)
		self.details_label.config(text=air_text)


if __name__ == "__main__":
	root = tk.Tk()
	WeatherApp(root)
	root.mainloop()
