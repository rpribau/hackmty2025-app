
# HackMTY 2025 App

This is a mobile application developed for the HackMTY 2025 hackathon, built using React Native and Expo.

The application is an operations management tool designed for two primary user roles: **Operators** and **Supervisors**. It guides operators through a specific multi-step workflow involving batch registration, 3D-assisted packing, and assisted returns. Supervisors are provided with a separate dashboard interface to monitor key metrics.

## Key Features

Based on the application's dependencies and screen structure, its key features include:

* **Role-Based Navigation**: Separate navigation stacks for "Operador" (Operator) and "Supervisor" profiles.
* **Guided Operator Workflow**: A three-step process for operators:
    1.  **Paso 1: Registrar Lote** (Step 1: Register Batch)
    2.  **Paso 2: Empaque Guiado** (Step 2: Guided Packing), which includes a 3D visualization screen.
    3.  **Paso 3: Retorno Asistido** (Step 3: Assisted Return)
* **3D Visualization**: Utilizes `react-three/fiber`, `expo-gl`, and `three.js` to render 3D models as part of the guided packing process.
* **Barcode Scanning**: Integrates `expo-barcode-scanner` and `expo-camera` for a modal-based scanner component.
* **Supervisor Dashboards**: A tab-based navigator for supervisors (`SupervisorTabNavigator`), likely for displaying analytics.
* **Data Visualization**: Includes `react-native-chart-kit` for rendering charts.
* **Modern UI Components**: Uses `react-native-reanimated`, `react-native-gesture-handler`, and `@gorhom/bottom-sheet` for a modern, interactive UI.

## Tech Stack

This project is built with Expo and leverages the following core technologies:

* **Framework**: React Native 0.81.5 & Expo SDK 54
* **Language**: JavaScript
* **Navigation**: React Navigation v7 (`@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`)
* **3D Rendering**: `@react-three/fiber`, `@react-three/drei`, `three`, `expo-gl`
* **Gestures & Animations**: `react-native-gesture-handler`, `react-native-reanimated`
* **UI Components**: `@gorhom/bottom-sheet`, `lucide-react-native` (icons)
* **Charts**: `react-native-chart-kit`, `react-native-svg`
* **Hardware API**: `expo-camera`, `expo-barcode-scanner`
* **Polyfills**: `base-64`, `react-native-url-polyfill`

## Application Screens

The main navigation stack defined in `App.js` includes the following screens:

* **Login**: "Seleccionar Perfil" (Select Profile) - The initial screen.
* **OperadorLogin**: "Iniciar Sesión" (Log In) - Login screen for operators.
* **OperadorHome**: "Tareas de Operador" (Operator Tasks) - Main menu for operators.
* **RegistroDeLote**: "Paso 1: Registrar Lote" (Step 1: Register Batch).
* **EstacionDeEmpaque**: "Paso 2: Empaque Guiado (3D)" (Step 2: Guided Packing (3D)).
* **EmpaqueGuiado**: "Paso 2: Empaque Guiado" (Step 2: Guided Packing).
* **RetornoAsistido**: "Paso 3: Retorno Asistido" (Step 3: Assisted Return).
* **SupervisorHome**: Houses the `SupervisorTabNavigator` (headers hidden).
* **Scanner**: "Escanear Código" (Scan Code) - A modal screen for scanning.

## Available Scripts

In the project directory, you can run the following commands:

* `npm start`
    Runs the app in development mode using Expo Go.

* `npm run android`
    Starts the app on a connected Android device or emulator.

* `npm run ios`
    Starts the app on the iOS simulator.

* `npm run web`
    Starts the app in a web browser.
