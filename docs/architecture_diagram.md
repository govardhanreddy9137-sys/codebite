# CodeBite System Architecture

This diagram illustrates the high-level architecture of the CodeBite Food Management Platform in a clean, black-and-white technical format.

```mermaid
graph TD
    %% Global Styles
    classDef bw fill:#fff,stroke:#000,stroke-width:2px,color:#000;
    
    subgraph "Client Tier (Frontend)"
        A["Customer Interface"]:::bw
        B["Merchant Portal"]:::bw
        C["Raider Dashboard"]:::bw
        D["Admin Dashboard"]:::bw
    end

    subgraph "Application Tier (Backend)"
        E["Node.js / Express Server"]:::bw
        F["Order Management"]:::bw
        G["User Authentication"]:::bw
    end

    subgraph "Data Tier"
        H[("Central Database")]:::bw
    end

    A --- E
    B --- E
    C --- E
    D --- E
    E --- F
    E --- G
    F --- H
    G --- H
```

### **Architecture Overview**
*   **Frontend**: React-based modular interfaces for each user role.
*   **Backend**: Node.js server managing business logic and API requests.
*   **Database**: Centralized repository for all platform data.
