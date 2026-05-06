# 🔒 WhisperBox Messenger

A secure, end-to-end encrypted messaging application built with React, TypeScript, and Web Crypto API. Features military-grade encryption, real-time messaging, and a modern, responsive UI.

[WhisperBox Preview](https://e2e-messaging-app.vercel.app/)

## ✨ Features

### 🔐 **Security First**

- **End-to-End Encryption**: All messages are encrypted using AES-GCM with RSA key exchange
- **Zero-Knowledge Architecture**: Private keys never leave your device
- **Secure Key Storage**: Private keys stored locally in IndexedDB with PBKDF2 protection
- **Cryptographic Key Wrapping**: AES-GCM encryption for private key storage

### 💬 **Messaging**

- **Real-time Chat**: Instant messaging with message history
- **User Management**: Add and manage contacts
- **Message Encryption**: Automatic encryption/decryption of all messages
- **Secure Communication**: RSA-OAEP for key exchange, AES-GCM for message encryption

### 🎨 **User Experience**

- **Responsive Design**: Works seamlessly on desktop and mobile
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **Toast Notifications**: Real-time feedback for all actions
- **Form Validation**: Client-side validation with helpful error messages
- **Accessibility**: WCAG compliant with proper ARIA labels

### 🔧 **Technical Features**

- **TypeScript**: Full type safety throughout the application
- **React 19**: Latest React features with modern hooks
- **Vite**: Fast development and optimized production builds
- **Web Crypto API**: Browser-native cryptographic operations
- **IndexedDB**: Local storage for cryptographic keys

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with Web Crypto API support
- Backend API server (WhisperBox API)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/justtimi/e2e-messaging-app
   cd e2e-messaging-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

The application will be available at `http://localhost:5173`

## 📖 Usage Guide

### 🔐 Account Setup

1. **Sign Up**
   - Visit the registration page
   - Enter username, display name, and password
   - Account creation automatically generates RSA key pair
   - Public key is sent to server, private key stored locally

2. **Log In**
   - Enter your credentials
   - Application restores your cryptographic keys
   - Access your encrypted conversations

### 💬 Sending Messages

1. **Select Contact**
   - Choose a user from the contacts sidebar
   - Messages are automatically encrypted

2. **Send Message**
   - Type your message in the input field
   - Messages are encrypted before transmission
   - Recipients automatically decrypt messages

### ⚙️ Settings & Account

- **Profile**: View and manage your account information
- **Settings**: Application preferences (coming soon)
- **Logout**: Securely sign out and clear local session

## 🏗️ Architecture

### Frontend Architecture

```
src/
├── api/                 # API client functions
│   ├── auth.ts         # Authentication endpoints
│   ├── client.ts       # Base API configuration
│   └── messages.ts     # Messaging endpoints
├── auth/               # Authentication context
│   ├── AuthContext.tsx # User session management
│   └── ProtectedRoute.tsx # Route protection
├── components/         # Reusable UI components
│   ├── Button.tsx      # Styled button component
│   ├── Input.tsx       # Form input component
│   ├── Toast.tsx       # Notification system
│   └── SettingsDropdown.tsx # User menu
├── crypto/             # Cryptographic operations
│   ├── e2ee/          # End-to-end encryption
│   │   ├── encryption.ts    # AES-GCM operations
│   │   ├── keyManagement.ts # RSA key generation
│   │   └── messageCrypto.ts # Message encryption
│   └── utils/         # Crypto utilities
│       ├── constants.ts     # Crypto constants
│       ├── encoding.ts      # Base64/ArrayBuffer utils
│       └── keyWrapping.ts   # Key wrapping operations
├── db/                # Local storage
│   ├── indexedDB.ts   # IndexedDB operations
│   └── keyStore.ts    # Private key storage
├── features/          # Feature modules
│   └── messaging/     # Chat functionality
├── pages/             # Page components
│   ├── Login.tsx      # Authentication page
│   ├── Register.tsx   # Account creation
│   └── Chat.tsx       # Main chat interface
└── types/             # TypeScript definitions
    └── types.ts       # Application types
```

### Security Architecture

#### Key Generation & Storage

1. **RSA Key Pair Generation**: 2048-bit RSA keys generated on signup
2. **Private Key Protection**: Encrypted with AES-GCM using PBKDF2-derived key
3. **Local Storage**: Private keys stored in IndexedDB, never transmitted
4. **Public Key Exchange**: RSA public keys shared via secure API

#### Message Encryption Flow

```
Sender                     Receiver
  │                           │
  ├── Generate AES key        │
  ├── Encrypt message         │
  ├── Encrypt AES key with    │
  │   receiver's public key   │
  ├── Send encrypted data     │
  │                           │
  │          Encrypted data   │
  │──────────────────────────►│
  │                           │
  │                           ├── Decrypt AES key with
  │                           │  private key
  │                           ├── Decrypt message with
  │                           │  AES key
  │                           └── Display message
```

## 🔧 API Reference

### Authentication Endpoints

#### `POST /auth/register`

Register a new user account.

**Request Body:**

```json
{
  "username": "string",
  "display_name": "string",
  "password": "string",
  "public_key": "string (SPKI format)",
  "wrapped_private_key": "string (base64)",
  "pbkdf2_salt": "string (base64)"
}
```

#### `POST /auth/login`

Authenticate user credentials.

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

#### `GET /auth/me`

Get current user information.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

#### `GET /auth/users`

Get all registered users.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

### Messaging Endpoints

#### `GET /messages`

Get conversation with specific user.

**Query Parameters:**

- `user_id`: Target user ID

**Headers:**

```
Authorization: Bearer <jwt_token>
```

#### `POST /messages`

Send encrypted message.

**Request Body:**

```json
{
  "receiver_id": "string",
  "encrypted_content": "string",
  "iv": "string",
  "encrypted_aes_key": "string"
}
```

## 🔒 Security Features

### End-to-End Encryption

- **AES-GCM**: Symmetric encryption for message content (256-bit keys)
- **RSA-OAEP**: Asymmetric encryption for key exchange (2048-bit keys)
- **Perfect Forward Secrecy**: Each message uses unique AES keys

### Key Management

- **PBKDF2**: Password-based key derivation for private key encryption
- **Salt Generation**: Random 16-byte salts for each user
- **Key Wrapping**: AES-GCM encryption of private keys
- **Local Storage**: IndexedDB for secure key storage

### Authentication Security

- **JWT Tokens**: Stateless authentication with access/refresh tokens
- **Secure Storage**: Tokens stored in localStorage with automatic cleanup
- **Session Management**: Automatic token refresh and logout on expiration

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint


```


### Code Quality

- **ESLint**: Code linting and formatting
- **TypeScript**: Strict type checking
- **Prettier**: Code formatting (via ESLint)


## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Heroicons](https://heroicons.com/)
- Web Crypto API for cryptographic operations
