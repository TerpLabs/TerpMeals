![image](https://github.com/user-attachments/assets/2ee6e5a3-3562-4f9c-ab4d-952386ca1db9) 

# **Welcome to TerpMeals!**

_NOTE: The app is still currently under development_

This is an app showing the daily menu of UMD dining halls, and contains an inbuilt calorie tracker with account personalization. It includes features to build on your broader weight and body goals and helps you learn the specifics and plan around them. College is a great time to chase your fitness goals, and TerpMeals is here to make it easier for you!

Here's what we're looking like so far (Note that these are from a web view):
![image](https://github.com/user-attachments/assets/0e6aaf0b-babe-43d6-bb31-ac32e0be464a)
![image](https://github.com/user-attachments/assets/f03762f2-b580-4743-999f-cddf027fba47)

More features are planned like taking pictures of food to assist in determining how many servings you're eating, and full meal planning with suggestions based on your goals and common meals people like.

# For the tech people

The app's being made with React Native + Expo, with Express for the backend. Data is stored in MongoDB, and the daily updaters for the menu and nutrition are Puppeteer and Cheerio Scrapers that are on Lambda functions ran daily with an EventBridge Cron event. 
