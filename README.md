# Inventory App

A simple and efficient application for managing inventory. Track products, suppliers, and stock levels with ease.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Technologies Used](#technologies-used)

## Features

- Add, update, and delete inventory/product items types
- Create orders to produce products
- Track stock levels and get alerts for low stock

## Installation

   ```bash
   git clone https://github.com/lespons/storiful
   
   npm install
   
   # Create an .env file that contains the required variables (eg use test.env)
   
   # create the user in database check [User creation](#user-creation)
   
   npm run build
   npm run start

## User creation
`salt = await bcrypt.genSalt(10);`\
`password = await bcrypt.hash("password", salt)`
```

## 📖 Usage Guide

1. 🚀 Launch the Application
    - Start the application to access its features.

2. 🔑 Log In
    - Log in using your account credentials to access the main dashboard.

3. 🏢 Manage Inventory in the Warehouse Tab. Use the Warehouse tab to manage your inventory items:
    - Create Items:
        - If you produce a product, such as a [Cheese Cake], create items for each ingredient (e.g., cracker crumbs,
          unsalted butter, granulated sugar).
        - Create a product item like [Cheese Cake] and link it to its ingredients. Configure the quantities needed to
          produce the cake.
    - Clone Items:
        - Use the long press action on the button to clone existing items.
    - Delete Items:
        - Use the long press action on the button to delete items from the inventory.
4. 📦 Manage Orders in the Orders Tab. Create and manage orders to track your stock levels:
    - Create Orders:
        - As you create an order, the application will show you how many products you can make with your current stock
          and highlight any missing ingredients.
        - Set up deadlines and add descriptions to orders.
    - Complete Orders:
        - When you complete items in an order, the stock levels for ingredients decrease, and the stock for finished
          products increases.
          If an item is already in stock, you can use the "Use Stock" button to complete the item without changing the
          stock levels.
          Completing an order changes its status to "Completed."
          Manage Completed Orders:

    - Archive: Change the status to archived (after 30 days, the order will be hidden from the board). Use the long
      press action.
    - Send: Reduce the stock of created items (after 30 days, the order will be hidden from the board). Use the long
      press action.
        - Before sending, you can adjust the number of items to send.
    - Duplicate Orders:
    - Use the "Clone" button to duplicate an order and move it to the TODO column for similar future orders.
    - Modify Stock Values:
        - Add: Incrementally add values to the current stock.
        - Set: Override the current stock value. Use the long press action to set values.
    - Search by items
        - when you click the item in stock view, you will see the orders where this item is used
5. 🔍 Track Orders. Use the Orders tab to:
    - View all orders in various states.
    - Monitor current orders to check required ingredients and track progress.

## Screenshots
![Wareshouse](https://res.cloudinary.com/aroundy/image/upload/v1721772186/assets/itojoz2bdbumo4zmq5v4.jpg)
*Caption: The item creation with inventory type.*
![Warehouse](https://res.cloudinary.com/aroundy/image/upload/v1721772820/assets/eqnbibwarolu1d97ictn.jpg)
![Warehouse](https://res.cloudinary.com/aroundy/image/upload/v1722174074/assets/rblvnjkmne4acvzeurmp.jpg)
*Caption: The item with Product type.*
![Dashboard](https://res.cloudinary.com/aroundy/image/upload/v1722174533/assets/hrfvihyrgmiwcsnko6ph.jpg)
*Caption: The order creation and stock levels.*
![Dashboard](https://res.cloudinary.com/aroundy/image/upload/v1722174643/assets/nzcccj3z0svmlzybsolz.jpg)
*Caption: The orders completion and stock levels.*
![Dashboard](https://res.cloudinary.com/aroundy/image/upload/v1722174843/assets/z5grc3telwsfwumadkfa.jpg)
*Caption: Search by item 
![Orders](https://res.cloudinary.com/aroundy/image/upload/v1722174918/assets/rked7rvtgq6mhvauwwy5.jpg)
*Caption: Order tracking

## Technologies Used

- React
- Nextjs
- Node.js
- NextAuth
- Prisma (postgres)
- Tailwindcss
- Playwright

## Contact

Created by [Stanislau]() - feel free to contact me!
Email: stanislaudubrouski@gmail.com

![License](https://img.shields.io/badge/license-MIT-blue)

