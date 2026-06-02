## Problem
I have created this repository for learning system design.

## Solution
The idea is to visualize different systems and thier underlying architechture. We are not going to build the entire system, instead we are going to document it and create a visualization by charts and graphs to show the system.

## Features
- I want a dashboard to navigate beteween the systems
- A logical grouping between the systems on the basis of their underlying architechture.
- Each system has to be visualized via chart and graphs, can use mermaid script or suggest something better.
- Each system will have documentation to be read on how and why and what.
- AI summaries
- Links to Outside documentation and technologies if needed.


## Updated Doc
# Interactive System Design Knowledge Graph

## Overview

This project is an interactive system design learning platform that breaks down complex systems into reusable components and visualizes how they interact.

It consists of two parallel layers:

1. Systems — complete architectures composed of multiple components
2. Components — deep dives into individual building blocks such as load balancers, sharding, caching, and storage

The goal is to create a structured, visual, and interconnected understanding of system design.

---

## Objectives

* Understand system design through decomposition into components
* Build deep knowledge of core infrastructure concepts
* Create interactive visualizations to simulate real-world behavior
* Establish relationships between systems and reusable components
* Maintain consistent learning through daily contributions

---

## Architecture of the Project

### 1. Systems Layer

Contains real-world system designs such as:

* URL Shortener
* Chat System
* Notification System
* Rate Limiter
* Feed System

Each system includes:

* Component breakdown
* Data flow
* Architecture diagrams
* Links to component deep-dives

---

### 2. Components Layer

Contains detailed explanations of core building blocks:

* Load Balancer
* Sharding / Partitioning
* Caching
* Message Queues
* Blob Storage

Each component includes:

* Problem definition
* Internal working
* Types and variations
* Trade-offs
* Real-world usage
* Interactive visualization

---

## Linking Strategy

This project follows a bidirectional linking model:

* Systems reference components they use
* Components list systems where they are applied

This creates a navigable knowledge graph rather than isolated documentation.

---

## Visualizations

Visualizations are a key part of this project and are implemented using frontend technologies.

### System Visualizations

* Architecture diagrams
* Request flow simulations

### Component Visualizations

* Load balancing simulation
* Cache hit/miss demonstration
* Sharding distribution
* Queue processing flow

---

## Tech Stack

* Frontend: React + Vite + Tailwind
* Visualization: SVG / Canvas / React Flow / D3
* Documentation: Markdown + Mermaid

---

## Folder Structure

systems/ <system-name>/
components.md
data-flow.md
diagrams/
visualizations/

components/ <component-name>/
overview.md
working.md
types.md
tradeoffs.md
visualizations/

shared/
patterns/

---

## Workflow

Work progresses along two parallel tracks:

### System Track

* Define system
* Identify components
* Create architecture diagrams
* Link to components

### Component Track

* Pick a component
* Document internal behavior
* Add trade-offs
* Build visualization

---

## Non-Goals

* Building production-grade distributed systems
* Implementing full backend infrastructure
* Covering DevOps or deployment in depth

---

## Expected Outcomes

* A structured system design knowledge base
* Deep understanding of distributed system components
* Strong visualization-based learning
* A portfolio-ready project demonstrating system thinking
* Convert into an interactive documentation website use - vercel or netlify to deploy the application.

---

## Future Enhancements
* Add animations and scenario simulations
* Introduce failure-mode visualizations
* Build reusable visualization components

---