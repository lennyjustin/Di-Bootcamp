// Creating Objects

class Video {
  constructor(title, uploader, time) {
    this.title = title;
    this.uploader = uploader;
    this.time = time;
  }

  watch() {
    console.log(`${this.uploader} watched all ${this.time} of ${this.title}!`);
  }
}

// Instantiate first Video instance
const video1 = new Video('JavaScript Basics', 'Alice', 300);
video1.watch();

// Instantiate second Video instance
const video2 = new Video('React Tutorial', 'Bob', 600);
video2.watch();

// Bonus: Array to store data for five Video instances
const videoData = [
  { title: 'JavaScript Basics', uploader: 'Alice', time: 300 },
  { title: 'React Tutorial', uploader: 'Bob', time: 600 },
  { title: 'Node.js Guide', uploader: 'Charlie', time: 450 },
  { title: 'CSS Flexbox', uploader: 'Diana', time: 200 },
  { title: 'HTML5 Features', uploader: 'Eve', time: 350 }
];

// Loop through the array to instantiate those instances
const videos = videoData.map(data => new Video(data.title, data.uploader, data.time));

// Call watch() on each instance
videos.forEach(video => video.watch());