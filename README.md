# 🛍️ Shopify Live Theme — CLI + VS Code + GitHub Workflow

This repository contains a Shopify theme managed through **Shopify CLI**, developed inside **Visual Studio Code (VS Code)**, and version-controlled via **Git + GitHub**.

It serves as a guide and workflow for building, editing, and deploying a live Shopify theme while maintaining full control through local development and version history.

---

## 📌 Description

A full development setup to:

- Pull live Shopify theme code to your local machine  
- Edit and preview themes in VS Code using Shopify CLI  
- Commit and push changes to GitHub  
- Push finalized changes back to the live Shopify store

---

## 🧰 Requirements

- Shopify Partner or store access
- Node.js + npm installed
- [Shopify CLI](https://shopify.dev/docs/themes/tools/cli/installation) installed
- Git & GitHub account
- VS Code with recommended extensions (see below)

---

## ⚙️ Initial Setup: Shopify CLI → VS Code → GitHub

### 🔁 1. Clone or Pull Theme from Shopify

```bash
shopify login --store your-store-name.myshopify.com
shopify theme pull
```
### 🔁 2. Install Shopify CLI

```bash
[git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
cd YOUR-REPO-NAME](https://shopify.dev/docs/themes/tools/cli/installation)

```
### 🔁 3. Login to Your Shopify Store

```bash
shopify login --store your-store-name.myshopify.com

```
### 🔁 4. Start Development Server

```bash
shopify theme dev

```
### 🔁 5. Push Changes to Shopify

```bash
shopify theme push

```
### 🔁 6. Pull from Shopify (if others made changes)

```bash
shopify theme pull

```
### 🔁 7. Initialize Git (if not already done)

```bash
git init
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

```
### Then commit and push:
```bash
git add .
git commit -m "Initial commit"
git push -u origin main

```

### 🔁 8. Recommended VS Code Extensions

## To improve your dev experience:

- Shopify Liquid – syntax highlighting for Liquid.
- Tailwind CSS IntelliSense – if your theme uses Tailwind.
- Prettier – auto-formatting code.
- GitLens – Git history and insights.
