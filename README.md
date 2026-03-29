# FinDash - Personal Finance Visualizer 🚀

FinDash is a dynamic, modern digital dashboard built specifically around the theme of visualizing data and presenting meaningful insights. The purpose of this application is to track your daily income and expenses while offering a beautifully animated dashboard that responds instantly to user interaction.

## ✨ Features

- **Live KPI Tracking**: The dashboard instantly computes your **Total Balance**, **Total Income**, and **Total Expenses** based on your transaction history.
- **Dynamic DOM-Based Visual Summary**: Breaking away from heavyweight third-party charting libraries, this project dynamically generates and animates a bar chart breakdown of your spending purely via custom JavaScript DOM manipulation calculation.
- **Transaction Logger**: A full CRUD system that allows you to add or delete transactions. It supports custom descriptions, numeric amounts, and categorization.
- **Sidebar SPA Navigation**: Smooth fade-in and view-switching logic that mimics a framework router entirely written in Vanilla JS. 
- **Offline Persistence & Failsafe**: Uses the browser's `localStorage` to save your data permanently, with a robust fallback system that triggers an in-memory database if `localStorage` access is blocked (e.g., when opening `file:///` URLs directly).
- **Glassmorphic Aesthetic**: A premium dark-mode UI with sleek glowing accents, custom animations, and responsive flexbox/grid layouts.

## 🛠️ Technology Stack

1. **HTML5**: Clean, highly semantic document structure.
2. **CSS3**: Variables for theming, custom keyframe animations, pseudo-classes, and flexbox alignments.
3. **Vanilla JavaScript**: Pure JS implementation featuring logic separation, DOM caching, state management algorithms, mathematical aggregations for charts, and event delegation.

> *Note: This project deliberately avoids using libraries like React or Chart.js to strictly demonstrate competency in pure DOM manipulation and logic separation.*

## 🚀 How to Run

Because this project is built entirely on native web standards, it does not require a backend or a Node.js node package manager (`npm`) installation.

1. Clone or download this project folder.
2. Double-click the `index.html` file to open it automatically in your default internet browser (such as Google Chrome, Firefox, or Microsoft Edge). 
3. *Alternative*: Open the directory in VS Code and use the **Live Server** extension.

## 📂 Project Structure

```text
📦 endtrem-P2
 ┣ 📜 index.html  # Main application structure
 ┣ 📜 style.css   # Stylesheets, visual theme, CSS variables
 ┣ 📜 script.js   # Controllers, DOM interactions, and state management
 ┗ 📜 README.md   # Documentation
```
