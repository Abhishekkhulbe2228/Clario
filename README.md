# Clario

### Your Intelligent Workplace Assistant

Clario is an **Agentic RAG-based HR assistant** designed to help employees get fast, reliable, and source-backed answers to workplace and HR-related questions.

Unlike a traditional RAG pipeline that simply retrieves documents and generates an answer, Clario evaluates the retrieved evidence, decides whether it is sufficient, and can fall back to web search or rewrite the query when necessary.

> **From employee questions to trusted answers.**

---

## ✨ Features

- 🤖 **Agentic RAG workflow** powered by LangGraph
- 📚 **Private HR knowledge base** using Pinecone
- 🔍 **Semantic document retrieval**
- ✅ **Evidence grading** before answer generation
- 🌐 **Web search fallback** using Tavily
- 🔄 **Query rewriting and retry**
- 📌 **Source-backed answers**
- 🔎 **Execution / decision trace**
- 📄 **HR document ingestion**
- 📝 **Feedback and audit logging**
- ⚡ **FastAPI backend**
- 🖥️ **Web-based employee interface**
- 🐳 **Dockerized application**
- ☁️ **DigitalOcean deployment**

---

## 🎯 Problem

Organizations often have large collections of HR documents containing:

- Leave policies
- Remote-work guidelines
- Attendance rules
- Payroll information
- Employee benefits
- Onboarding and offboarding procedures
- Code-of-conduct guidelines
- HR forms and policies

Even when this information exists, employees may still contact HR because finding the correct document or understanding which policy applies can be difficult.

A traditional keyword search can return multiple documents without providing a clear answer.

A basic chatbot also introduces another problem: it may generate an answer even when reliable company evidence is unavailable.

Clario is designed to solve this problem by prioritizing **trusted internal HR knowledge** and evaluating evidence before generating an answer.

---

## 🧠 Why Agentic RAG?

A traditional RAG system usually follows:

```text
Question
   ↓
Retrieve Documents
   ↓
Generate Answer