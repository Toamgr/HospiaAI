# **HESTIA: The Venue Intelligence Graph Operating System**

Research archive note: This document is supporting research for HESTIA Venue Intelligence. It is not canonical product doctrine and should not be implemented directly without passing HESTIA's provenance, confidence, role-access, venue-boundary, and human-approval guardrails.

Knowledge graph guardrail: Venue Intelligence Graph / Hospitality Knowledge Graph is research and internal architecture exploration only. It is not a current production graph, not a fake data relationship engine, and not authority to infer venue reality without real evidence, provenance, confidence labeling, venue boundaries, role access, and human approval for high-impact decisions.

## **Foundations of Venue Intelligence Graphs**

### **Defining the Knowledge Graph in Hospitality Architecture**

A knowledge graph represents a paradigm shift in data architecture, moving away from storing information in isolated documents or tabular databases toward organizing facts, concepts, and entities into a unified semantic network1. In the context of hospitality customer experience and operations, a knowledge graph serves as a semantic abstraction layer1. It unifies disparate operational data streamsג€”such as Property Management Systems (PMS), Point of Sale (POS) terminals, and Customer Relationship Management (CRM) databasesג€”into a connected graph of real-world entities and their relationships1.
Unlike traditional databases that rely on keyword-matching or static foreign-key joins, a knowledge graph uses a formalized ontology to define the meaning and rules of relationships1. For example, a lodging unit is modeled as both a physical space (schema.org/Place) and a commercial product (schema.org/Product), allowing the system to understand how room features and price offers interact with guest preferences and real-time occupancy5.

### **The Utility of Graphs in Complex Organizations**

Complex hospitality organizations operate in highly dynamic environments where physical assets, human resources, financial budgets, and brand standards are constantly interacting3. Traditional databases struggle to capture these relationships, creating operational silos between departments like the front desk, kitchen, and corporate finance2.
Integrating a knowledge graph allows an organization to build an Enterprise Digital Twin (EDT)6. This framework maps the venue across five core context layers: reporting structures, policy constraints, real-time activity states, past decisions, and institutional knowledge6.
Exposing this semantic context through a Model Context Protocol (MCP) allows AI agents to make contextually grounded decisions that respect the venue's operational constraints and brand standards6.

| Context Layer | Primary Content Types | Operational Value | Ingestion Frequency |
| :---- | :---- | :---- | :---- |
| **Reporting Structure** | Reporting relationships, decision rights, regional role permissions6. | Coordinates task assignments and approval levels6. | Low (Updates on org changes) |
| **Policy Constraint** | Regulatory rules, brand standards, dynamic policy hierarchies6. | Ensures AI decisions comply with local laws and corporate guidelines6. | Medium (Updates on policy revisions) |
| **Operational Activity** | Live budget, staff schedules, table queues, system statuses6. | Provides real-time context to keep recommendations aligned with current resources6. | Real-Time (Continuous sensor/API streams) |
| **Tacit Knowledge** | Step-by-step service standards, team preferences, localized workflows6. | Documents informal, experiential knowledge for training and quality control6. | Medium (Updates during team reviews) |
| **Decision Precedent** | Documented choices, historical rationales, actual outcomes6. | Evaluates past actions to improve future operational playbooks6. | Medium (Updates after key incidents) |

### **Relational Dynamics vs. Flat Hierarchies**

Hospitality operations are relational, and flat database structures are unable to capture the real-time interactions that occur on the floor2. In a typical restaurant or hotel, events do not occur in isolation; instead, they are connected by spatial, temporal, and human factors7.
For instance, a guest complaint about a delayed order is rarely caused by a single failure10. It is often the result of several interacting factors: the table's physical distance from the kitchen, high order volume during a shift, a temporary staff shortage, and a complex menu item that overloads a specific kitchen station7.
Flat transactional databases record the ticket time and the complaint, but they cannot connect these points to diagnose the root cause2. A relational graph, however, maps these interactions across physical, human, and operational layers, allowing systems to analyze and optimize the entire service workflow6.

## **The Ontological Blueprint of a Hospitality Venue**

### **Core Entities of the HESTIA Taxonomy**

To establish a complete, structured representation of a venue, HESTIA's ontology defines twenty-seven core entities5. These entities are mapped to standardized semantic classes, ensuring that both internal models and external AI agents can accurately interpret and interact with the venue's data5.

| Entity Name | Semantic Base Class | Primary Structural Fields | Graph Role & Structural Significance |
| :---- | :---- | :---- | :---- |
| **Venue** | schema.org/LodgingBusiness [cite: 5, 8] | id, name, taxID, geoCoordinates, starRating [cite: 5] | The root node representing the physical and operational enterprise5. |
| **Founder** | schema.org/Person | id, name, strategicDirectives, riskTolerance | Defines the top-level operational vision and core brand identity6. |
| **Owner** | schema.org/Organization | id, corporateName, equityPercentage, financialTargets | Establishes the financial boundaries and capital constraints for the venue6. |
| **Manager** | schema.org/Person | id, name, overrideAuthorityLevel, leadershipStyle | Represents the operational decision-makers who resolve floor incidents6. |
| **Employee** | schema.org/Person | id, name, skillsProfile, workloadIndex [cite: 7] | Represents front-of-house (FOH) and back-of-house (BOH) staff9. |
| **Guest** | schema.org/Person | id, name, anonymizationSalt, lifetimeValue | Mapped to transactions, preferences, and direct feedback profiles3. |
| **Menu** | schema.org/Menu [cite: 4] | id, seasonality, activeStart, activeEnd [cite: 6] | Defines the structured collection of food and beverage offerings4. |
| **Cocktail** | schema.org/MenuItem | id, prepSteps, glassware, complexityScore | A specialized beverage product with specific preparation steps4. |
| **Wine** | schema.org/MenuItem | id, vintage, varietal, supplierID, stockLevel | A beverage product linked directly to inventory and supplier networks16. |
| **Dish** | schema.org/MenuItem | id, allergenProfile, cookTime, stationID [cite: 9, 10] | A culinary product requiring coordination across kitchen stations10. |
| **Supplier** | schema.org/Organization | id, name, deliveryDays, reliabilityScore | Represents the external source of inventory and raw goods16. |
| **Shift** | schema.org/Event | id, startTime, endTime, laborBudget, demandForecast | A temporal operational window requiring labor allocation9. |
| **Incident** | schema.org/Event | id, category, severity, timestamp, status | Captures unexpected events, such as safety issues or service delays1. |
| **Event** | schema.org/Event [cite: 5] | id, eventType, guestCount, revenueContract | High-volume bookings, such as banquets or private parties5. |
| **Table** | schema.org/Place | id, tableNumber, seatingCapacity, zoneID [cite: 7] | A physical seating location on the floor plan7. |
| **Room** | schema.org/HotelRoom [cite: 5, 8] | id, roomType, bedConfig, occupancyStatus [cite: 5, 8] | A lodging unit available for booking and service delivery5. |
| **Floor Plan** | schema.org/Accommodation [cite: 5] | id, spatialGeometry, optimalServicePaths | The physical layout mapping spatial relationships between zones7. |
| **Guest Complaint** | schema.org/InformAction | id, issueType, verbatimText, compensationValue | Connects a guest directly to a product or service failure1. |
| **Training Module** | schema.org/CreativeWork | id, subject, passingScore, certID | An educational resource designed to build team capabilities17. |
| **Academy Cert** | schema.org/Credential | id, authority, earnedDate, expirationDate | A verified professional qualification held by an employee. |
| **Service Standard** | schema.org/Policy | id, pacingTarget, standardOperatingProcedure | Operational rules that govern service quality and execution speed6. |
| **Decision** | schema.org/Action | id, rationale, approvedBy, timestamp, outcome | A logged choice that modifies the physical or logical state of the graph6. |
| **Reputation Signal** | schema.org/Rating | id, sourcePlatform, score, weight | An external metric summarizing brand perception and sentiment1. |
| **Review** | schema.org/Review | id, sentimentScore, text, publishDate | Public feedback analyzed for semantic patterns and keywords18. |
| **Competitor** | schema.org/LocalBusiness | id, name, pricingTier, marketDistance | An external hospitality business that impacts local pricing strategies19. |
| **Pricing Change** | schema.org/UpdateAction | id, oldPrice, newPrice, triggerCondition | Logs manual or automated price adjustments for rooms or menu items6. |
| **Operational Risk** | schema.org/Risk | id, likelihood, impactScore, mitigationPlan | Represents vulnerabilities, such as supply shortages or labor deficits1. |

### **Operationalizing Relational Scenarios**

By establishing explicit relationships between these entities, HESTIA can analyze and optimize floor operations6. The table below outlines how HESTIA's relational logic models key operational scenarios on the floor.

| Relational Scenario | Domain Entity | Range Entity | Direct Evidence Source | Operational & Analytical Outcome |
| :---- | :---- | :---- | :---- | :---- |
| **Employee Served Guest** | Employee | Guest | POS transaction ID, tableside RFID tag scans7. | Triggers personalized tableside service and tracks server performance3. |
| **Guest Complained About** | Guest | Dish / Cocktail / Wine | Guest profiles, POS refund logs, CRM notes1. | Identifies product quality issues and prompts immediate service recovery3. |
| **Cocktail Caused Overload** | Cocktail | Shift | KDS ticket timestamps, bar queue counts10. | Signals that a complex recipe is slowing down service during peak hours10. |
| **Event Exposed Weakness** | Event | Shift | Time-card logs, event reports, schedule variances9. | Pinpoints labor shortages and scheduling gaps under high-volume stress9. |
| **Manager Resolved Incident** | Manager | Incident | Logged manager notes, system override receipts2. | Evaluates manager effectiveness and documents incident recovery playbooks6. |
| **Founder Rejected Suggestion** | Founder | Decision | Graph-UI click logs, ignored operational recommendations6. | Refines HESTIA's advice models to better match the founder's risk tolerance6. |
| **Supplier Issue Affected Menu** | Supplier | Menu | Inventory purchase orders, supplier status alerts16. | Prompts updates to print and digital menus when key ingredients run low16. |
| **Training Improved Recovery** | Training | Service Standard | Certification logs, guest sentiment metrics1. | Measures the business impact of training by tracking guest recovery rates1. |
| **Price Change Affected Value** | Pricing Change | Reputation Signal | Competitor price scrapers, public rating scores18. | Maps how dynamic price adjustments impact public value perception19. |
| **Review Mentioned Pacing** | Review | Table | Sentiment analysis, seating logs, floor plans7. | Identifies areas of the floor plan that suffer from consistent service delays7. |
| **Table Location Affected Issues** | Table | Floor Plan | Spatial layouts, coordinates, complaint logs7. | Uncovers physical bottlenecks, such as tables placed too close to high-traffic areas7. |
| **Staff Capability Led to Success** | Employee | Event | Event feedback, skills profiles, training logs9. | Guides labor scheduling by pairing complex events with certified staff9. |

## **Graph Intelligence vs. Legacy Reporting**

### **Uncovering Hidden Operational Patterns**

Traditional business intelligence systems generate static, aggregate reports, such as calculating average monthly food costs or weekly server labor expenses2. While these metrics help track historical budgets, they cannot explain *why* specific operational issues occur1.
A knowledge graph, on the other hand, allows operators to run multi-hop relational queries that reveal hidden patterns across physical, human, and operational layers13.

                  .------------------------------------------+
                  |  Legacy Analytics (Fragmented Databases)  |
                  .------------------------------------------+
                                       |
           .---------------------------+---------------------------+
           |                                                       |
           v                                                       v
[PMS: Room Bookings]                                    [POS: Dining Transactions]
* Records room revenue                                  * Records meal sales
* No insight into guest's F.B preferences               * No connection to guest's lodging status
           |                                                       |
           .---------------------------+---------------------------+
                                       |
                                       v
               .-----------------------------------------------+
               | HESTIA Graph Platform (Unified Abstraction)  |
               .-----------------------------------------------+
                                       |
                         (Semantic Data Reconciliation)
                                       |
                                       v
            Multi-Hop Analysis: "Connecting Lodging to Dining"
            * Automatically links room reservations to dining bills [cite: 2, 22]
            * Maps spatial seating preferences to overall room ratings
            * Automatically flags kitchen delays impacting front desk checkouts [cite: 3]

By connecting physical layouts, staff capabilities, and transactional history, HESTIA's graph structure helps operators identify the root causes of service bottlenecks and coordinate front-of-house and back-of-house workflows in real time7.

### **Vector Search vs. GraphRAG Frameworks**

Traditional Retrieval-Augmented Generation (RAG) systems use flat vector databases to retrieve text chunks based on semantic similarity13. While this works well for simple questions, vector search struggles with complex, multi-hop operational queries that require synthesizing information from separate sources13.
For example, if an operator asks, "Did our recent dynamic pricing update for the lobster dish impact server stress and overall dining pacing during weekend banquets?", a vector-only search will struggle to find a complete answer13. It will retrieve isolated documents about menu prices, shift schedules, and event reports, but it cannot connect these pieces13.
HESTIA's GraphRAG framework solves this issue by combining vector similarity search with structured graph reasoning13. The system first locates primary pivot nodes (e.g., the specific pricing event or shift log) and then traverses the connected edges to build a comprehensive context map13.

                     [User Operational Query]
                                |
             (Vector Search Locates Primary Pivot Nodes)
                                |
                                v
                       [:PricingChange Node]
                                |
                       (Graph Traversal)
                                |
                                v
       [:Dish Node] .------. [:Shift Node] .------. [:Incident Node]
                                |
                       (Community Summary)
                                |
                                v
               [Leiden Hierarchical Clustering]
                                |
                                v
                     Augmented Prompt for LLM

This approach allows HESTIA to generate accurate, context-aware answers that explain the connections between pricing changes, kitchen workflows, and guest sentiment13.

### **Personalized Contextual Matchmaking**

HESTIA uses its knowledge graph to improve guest recommendations by matching guest preferences directly to the venue's physical assets and services15. Instead of relying on generic collaborative filtering, the system builds an ontological match between a guest's profile and the venue's real-time capabilities14.
This matchmaking logic evaluates preference alignment (![][image1]) across several dimensions:
![][image2]
where:

* ![][image3] represents the semantic preference vector of Guest ![][image4], detailing their dietary needs and seating choices15.
* ![][image5] represents the attribute vector of the Offer or Item ![][image6], mapping its ingredients and preparation complexity5.
* ![][image7] measures the table's physical proximity to preferred layout features (e.g., quiet dining areas or live music stages)7.
* ![][image8] scales the score based on the guest's past relationship and service history with the scheduled server3.

This formula allows HESTIA to suggest personalized seating, menu items, and service paths that match the guest's past preferences and the venue's current capacity3.

## **Cognitive Graph Memory: Temporal Decay and Permanence**

### **The Velocity-Volatility Decay Surface**

To keep the knowledge graph clean and accurate, HESTIA's memory architecture must adapt as physical layouts, employee shifts, and guest preferences evolve26. Rather than applying a single, uniform decay rate to all data, HESTIA uses a hierarchical decay surface parameterized by two distinct signals:

1. **Velocity (![][image9]):** The frequency of observed interactions or transactions within a given operational window26.
2. **Volatility (![][image10]):** The rate of change in value between observations, measured as the semantic distance between successive state updates26.

The current strength of a relationship (![][image11]) is calculated using a modified Ebbinghaus exponential decay model26:
![][image12]
The relational durability parameter ![][image13] is defined as:
![][image14]

* **Hierarchical Scaling (![][image15]):** Scales decay rates across domain-level, department-level, and individual entity-level behaviors to balance global rules with specific operational histories26.
* **Velocity and Volatility Exponents (![][image16]):** Adjust the influence of observation frequency and value changes, preventing frequent but transient noise from overwhelming rare but important operational data26.

### **Concept-Value Duality in Hospitality Memory**

To prevent the loss of critical but rarely mentioned facts, HESTIA's memory model separates enduring *concepts* from transient *values*26. This ensures that permanent structural relationships are preserved even as their real-time parameters change26.

* **Enduring Concepts:** Critical relationships, such as a guest's severe peanut allergy or a brand's core safety policies, do not decay over time6. These facts are assigned an infinite durability score (![][image17]), ensuring they are always preserved and prioritized during query lookups6.
* **Transient Values:** Temporary, real-time statesג€”such as a table's occupancy status, a receptionist's heart rate, or a dynamic pricing discountג€”have a short shelf life7. These values are assigned high volatility and low durability parameters, allowing them to decay rapidly once the shift ends to keep the database running efficiently7.

## **Comprehensive 15-Category Venue Intelligence Graph Framework**

To deliver a comprehensive venue operating system, HESTIA integrates fifteen core structural, temporal, and security frameworks into its unified graph model.

### **1. Core Entities**

* **Why it Matters:** Establishes a standardized taxonomy to model the physical, operational, and financial assets of a venue5.
* **Data Requirements:** Imports structured data from hotel PMS databases, restaurant POS menus, corporate ERP files, and physical floor plan coordinates2.
* **Relationship Creation:** Generated through automated ETL pipelines, real-time API event logs, and semantic entity extraction from unstructured review text13.
* **Validation Protocols:** Validated by cross-referencing schema definitions against established schema.org vocabularies and relational database integrity constraints5.
* **Confidence Scoring:** Assigned a deterministic score of ![][image18] for verified, direct updates from systems of record2.
* **Persistence Profile:** Remains active in the graph until the corresponding real-world asset or policy is formally updated6.
* **AI Graph Reasoning:** Serves as the primary anchor nodes for semantic queries, GraphRAG traversals, and local context expansion13.
* **Misuse Prevention:** Protects sensitive core attributes (e.g., financial data or employee personal files) using role-based query restrictions6.

### **2. Relationship Types**

* **Why it Matters:** Maps the operational dependencies and workflows between different entities, moving beyond flat relational tables1.
* **Data Requirements:** Captures real-time transaction timestamps, work schedules, tableside terminal events, and customer feedback2.
* **Relationship Creation:** Formed dynamically when an operational transaction connects separate entities, such as linking a server to a guest check2.
* **Validation Protocols:** Verified by cross-referencing independent event records, ensuring that check timestamps match the corresponding kitchen logs8.
* **Confidence Scoring:** Calculated by evaluating the completeness of transaction data and the reliability of the source integrations7.
* **Persistence Profile:** Evaluated dynamically using the velocity-volatility decay surface to match the duration of the operational activity26.
* **AI Graph Reasoning:** Guides multi-hop path reasoning to trace service bottlenecks and evaluate staff workloads13.
* **Misuse Prevention:** Blocks automated systems from creating high-risk relationships without verifying cross-system transaction histories29.

### **3. Evidence Types**

* **Why it Matters:** Provides an immutable audit trail, linking graph relationships to original, verifiable operational records6.
* **Data Requirements:** Raw API responses, cryptographically signed system logs, checkout transaction receipts, and sensor data streams7.
* **Relationship Creation:** Attached as a secure metadata layer directly to newly created or updated relationships in the graph6.
* **Validation Protocols:** Verified using digital signatures and cryptographic hash matching to prevent data tampering29.
* **Confidence Scoring:** Ranked based on verification level, with cryptographically notarized event logs scoring higher than unverified manual entries29.
* **Persistence Profile:** Retained permanently in the graph alongside the related records to maintain an accurate historical log6.
* **AI Graph Reasoning:** Grounds language model responses in verified facts, ensuring that operational reports are traceable and auditable13.
* **Misuse Prevention:** Restricts raw audit logs behind secure access levels to protect sensitive corporate transactions6.

### **4. Confidence Scores**

* **Why it Matters:** Quantifies the reliability of inferred relationships, preventing AI systems from acting on weak or uncertain patterns20.
* **Data Requirements:** Multi-system validation logs, historical operational error rates, and manual manager override records6.
* **Relationship Creation:** Calculated automatically using Bayesian probability models when relationships are inferred from operational patterns18.
* **Validation Protocols:** Adjusted in real time as new transactional events confirm or contradict the inferred relationship25.
* **Confidence Scoring:** Evaluated continuously on a range of ![][image19], combining data completeness with multi-system consistency.
* **Persistence Profile:** Recalculated dynamically as new operational outcomes and events are ingested into the system7.
* **AI Graph Reasoning:** Acts as a quality filter, ensuring that automated actions are only triggered by highly confident patterns6.
* **Misuse Prevention:** Blocks automated tasks or alerts if confidence levels fall below defined safety thresholds6.

### **5. Temporal Memory**

* **Why it Matters:** Keeps the graph current by managing real-time operational states and preventing database clutter26.
* **Data Requirements:** Live sensor streams, tableside terminal events, active staff locations, and dynamic menu pricing6.
* **Relationship Creation:** Recorded in real time from live API endpoints, IoT devices, and active shift logs1.
* **Validation Protocols:** Confirmed by comparing successive state updates to verify active physical or operational conditions7.
* **Confidence Scoring:** Initial confidence begins high (![][image18]) and decays over time unless renewed by subsequent operational activity26.
* **Persistence Profile:** Decays rapidly based on time and activity, with a typical duration of 1 hour to 1 week26.
* **AI Graph Reasoning:** Powers real-time floor coordination, active shift adjustments, and direct tableside alerts3.
* **Misuse Prevention:** Prevents temporary, transient values from being interpreted as permanent operational trends or policies26.

### **6. Permanent Memory**

* **Why it Matters:** Preserves critical, long-term operational guidelines, brand standards, and customer safety profiles6.
* **Data Requirements:** Guest health profiles (allergies), strategic corporate directives, and building coordinate layouts5.
* **Relationship Creation:** Recorded through direct administrative setup, validated customer onboarding, or verified policy updates6.
* **Validation Protocols:** Requires formal validation and sign-off from an authorized venue manager or system administrator6.
* **Confidence Scoring:** Set to a permanent high confidence of ![][image18] upon direct administrative confirmation6.
* **Persistence Profile:** Preserved permanently in the graph, exempt from automated temporal decay6.
* **AI Graph Reasoning:** Serves as foundational guidelines for safety checks, core brand alignments, and compliance monitoring1.
* **Misuse Prevention:** Restricts modification of permanent records to authorized managers, requiring multi-factor authentication6.

### **7. Expiring Memory**

* **Why it Matters:** Optimizes graph storage and performance by archiving or deleting short-term transactional noise25.
* **Data Requirements:** Daily floor reports, temporary shift schedules, and dynamic table queues7.
* **Relationship Creation:** Generated automatically during standard, daily front-of-house and back-of-house operations10.
* **Validation Protocols:** Cross-referenced against active shift parameters and booking durations7.
* **Confidence Scoring:** Evaluated based on active usage, and drops once the associated shift or event ends26.
* **Persistence Profile:** Managed by automated database tasks that remove or archive records after defined operational windows7.
* **AI Graph Reasoning:** Provides short-term context for post-shift reviews, daily performance summaries, and immediate trend analyses9.
* **Misuse Prevention:** Automatically archives expiring data to prevent outdated records from skewing current performance models9.

### **8. Human-Confirmed Knowledge**

* **Why it Matters:** Establishes a verified, high-trust reference layer for critical operational playbooks and employee credentials6.
* **Data Requirements:** Signed training completions, incident incident logs, manager overrides, and formal corporate standards2.
* **Relationship Creation:** Formed when an authorized user formally approves or signs off on a recommendation in the interface6.
* **Validation Protocols:** Requires digital signatures and verification against the user's role and permission level6.
* **Confidence Scoring:** Set to a high-trust value of ![][image18] due to direct manual confirmation6.
* **Persistence Profile:** Retained in the graph until formally updated or overridden by a newer verified entry6.
* **AI Graph Reasoning:** Serves as a high-priority baseline for training recommendations, service standards, and operational playbooks1.
* **Misuse Prevention:** Logs all manual changes in an unalterable audit trail to maintain executive accountability6.

### **9. AI-Inferred Knowledge**

* **Why it Matters:** Discovers hidden operational bottlenecks and emerging trends that manual reviews might miss1.
* **Data Requirements:** Cross-system transaction metrics, public customer feedback, and multi-shift performance logs6.
* **Relationship Creation:** Generated through graph-based machine learning, community clustering, and causal analyses13.
* **Validation Protocols:** Checked and verified by comparing predictions against subsequent, real-world transactional outcomes32.
* **Confidence Scoring:** Modeled probabilistically and updated dynamically as new operational events are recorded30.
* **Persistence Profile:** Dynamic and temporary, adjusting automatically to reflect current operational performance13.
* **AI Graph Reasoning:** Identifies potential service bottlenecks and suggests proactive adjustments to training or floor schedules1.
* **Misuse Prevention:** Displays clear confidence levels for all AI inferences, preventing systems from acting on uncertain patterns6.

### **10. Privacy Boundaries**

* **Why it Matters:** Protects guest and employee privacy, ensures regulatory compliance, and builds system trust7.
* **Data Requirements:** Individual privacy selections, employee consent preferences, and regional data protection laws7.
* **Relationship Creation:** Applied as policy-driven security filters over specific nodes and attributes in the graph6.
* **Validation Protocols:** Verified using automated security audits to confirm absolute data isolation and compliance1.
* **Confidence Scoring:** Enforced deterministically, restricting access to protected attributes regardless of system state6.
* **Persistence Profile:** Enforced permanently across all system layers to maintain continuous compliance6.
* **AI Graph Reasoning:** Restricts AI analysis to authorized data, masking personal details to ensure compliant operations7.
* **Misuse Prevention:** Blocks and alerts administrators to any attempts to bypass privacy filters or access personal data6.

### **11. Causality Guardrails**

* **Why it Matters:** Prevents systems from making decisions based on simple correlation errors and false assumptions30.
* **Data Requirements:** Hypothesized causal graphs, historical operational logs, and baseline background variables34.
* **Relationship Creation:** Generated by applying structural causal equations and do-calculus rules to operational paths35.
* **Validation Protocols:** Checked by comparing inferred causal links against real-world operational changes30.
* **Confidence Scoring:** Evaluated based on the strength of d-separation paths and overall model consistency36.
* **Persistence Profile:** Updated continuously as new operational outcomes and outcomes are recorded31.
* **AI Graph Reasoning:** Evaluates the proposed impact of decisions (e.g., price changes) to ensure suggestions are logically sound6.
* **Misuse Prevention:** Blocks automated tasks from executing adjustments if the underlying causal model is unverified or ambiguous6.

### **12. Pattern Detection**

* **Why it Matters:** Discovers complex operational issues by analyzing relationships across physical and human structures1.
* **Data Requirements:** Multi-hop transactional records, spatial coordinates, and temporal schedules7.
* **Relationship Creation:** Identified using community detection, path traversals, and clustering algorithms13.
* **Validation Protocols:** Confirmed by checking discovered patterns across multiple independent system logs8.
* **Confidence Scoring:** Calculated by measuring the strength of the statistical connections within identified clusters24.
* **Persistence Profile:** Updated dynamically to ensure detection models match current operational conditions13.
* **AI Graph Reasoning:** Helps operators resolve complex bottlenecks, optimize space usage, and manage brand reputation1.
* **Misuse Prevention:** Flags and ignores temporary, short-term anomalies to prevent unnecessary operational adjustments26.

### **13. Recommendation Logic**

* **Why it Matters:** Delivers tailored, context-rich operational advice instead of generic, flat alerts1.
* **Data Requirements:** Dynamic venue status, strategic targets, and customer preference models6.
* **Relationship Creation:** Built by mapping target opportunities to current capabilities using graph-matching logic15.
* **Validation Protocols:** Monitored by logging how operators react to and interact with recommendations6.
* **Confidence Scoring:** Evaluated based on input data completeness and the verification tier of the source policies6.
* **Persistence Profile:** Valid only within its relevant operational window, and expires when venue states change26.
* **AI Graph Reasoning:** Guides staff schedules, menu designs, dynamic pricing, and personalized service paths9.
* **Misuse Prevention:** Generates transparent explanations for all recommendations, helping operators understand the underlying reasoning13.

### **14. Decision Memory**

* **Why it Matters:** Helps the venue continuously learn by archiving past decisions, rationales, and results6.
* **Data Requirements:** Operational choices, manager justifications, and subsequent performance metrics6.
* **Relationship Creation:** Logged automatically when managers accept, reject, or modify system suggestions6.
* **Validation Protocols:** Verified by comparing expected outcomes against actual, measured performance6.
* **Confidence Scoring:** Set to a permanent high confidence of ![][image18] once the human decision is logged6.
* **Persistence Profile:** Retained permanently to serve as a reliable reference for future operational choices6.
* **AI Graph Reasoning:** Builds a customized operational playbook, using historical precedents to guide future recommendations6.
* **Misuse Prevention:** Tracks all decision modifications in an unalterable audit trail to maintain executive accountability6.

### **15. Digital Twin Integration**

* **Why it Matters:** Bridges the gap between virtual planning and physical, real-world venue operations7.
* **Data Requirements:** IoT sensor feeds, 3D floor plans, spatial zones, and real-time transaction states7.
* **Relationship Creation:** Maps physical sensor events and coordinates directly onto the venue's logical graph7.
* **Validation Protocols:** Monitored using real-time connection checks and data stream health audits20.
* **Confidence Scoring:** Calculated based on sensor accuracy, signal frequency, and device validation status7.
* **Persistence Profile:** Updated in real time, with physical telemetry expiring quickly to keep data current7.
* **AI Graph Reasoning:** Visualizes customer flow, predicts queue congestion, and triggers real-time tableside alerts7.
* **Misuse Prevention:** Isolates physical control features behind secure firewalls to prevent unauthorized access or commands29.

## **Technical Blueprint: HESTIA Graph Architecture**

This blueprint details the structural database models, dynamic scoring calculations, and transactional update logic that power HESTIA's knowledge engine.

                      .------------------------------------+
                      | HESTIA Graph Update & Ingestion    |
                      .------------------------------------+
                                        |
                 .----------------------+----------------------+
                 |                                             |
                 v                                             v
     [Real-Time Event Stream]                        [Dynamic Processing]
     * Ingests POS/PMS transactions                  * Updates decay surfaces
     * Logs physical sensor telemetry      * Recalculates confidence
                 |                                             |
                 .----------------------+----------------------+
                                        |
                                        v
                       .-------------------------------+
                       | Ingestion Partitioning Logic  |
                       .-------------------------------+
                                        |
                 .----------------------+----------------------+
                 |                                             |
                 v                                             v
     [Sequential Partitions]                         [Parallel Thread Execution]
     * Groups writes by category           * Writes to independent nodes
     * Prevents database deadlocks          * Maximizes write throughput

### **1. Unified Entity and Relationship Property Graph Schema**

HESTIA's database schema maps the physical layouts, employee work histories, product configurations, and operational policies that define a hospitality venue5.

// CORE NODES & ATTRIBUTES

(:Venue {
  id: "V-77",
  name: "Artemis Hotel & Grill",
  brand_class: "Luxury_Boutique",
  geo_location: "37.7749, .122.4194",
  target_revpag_usd: 185.00
})

(:Founder {
  id: "FDR-01",
  name: "Constantine H.",
  strategic_directives: ["Prioritize tableside personalization", "Limit FOH-to-BOH ticket delay to 15m"],
  risk_tolerance: 0.35
})

(:Owner {
  id: "OWN-03",
  legal_name: "Apex Hospitality Holdings",
  financial_leverage_limit: 0.65,
  capital_expenditure_budget_usd: 1200000.00
})

(:Manager {
  id: "MGR-05",
  name: "Sophia Sterling",
  override_authority_level: 3,
  shift_pacing_target_multiplier: 1.05
})

(:Employee {
  id: "EMP-104",
  name: "Marcus Vance",
  base_role: "FOH_Lead_Server",
  wearable_pairing_reference: "W-991",
  assigned_pacing_index: 0.98
})

(:Guest {
  id: "GST-884",
  pseudonym_salt: "0xbf3a9e",
  lifetime_spend_usd: 12450.00,
  pacing_class: "Leisurely"
})

(:Menu {
  id: "MNU-W26",
  season: "Winter",
  version_tag: "2.1",
  valid_from: "2026-11-01T00:00:00Z",
  valid_to: "2027-03-01T23:59:59Z"
})

(:Cocktail {
  id: "CKT-09",
  name: "Smoked Mezcal Negroni",
  prep_complexity_score: 0.85,
  base_unit_cost_usd: 2.10,
  current_price_usd: 18.00
})

(:Wine {
  id: "WIN-415",
  name: "Domaine Tempier Bandol Rouge",
  vintage: 2021,
  varietal: "Mourvֳ¨dre",
  supplier_id: "SUP-14",
  inventory_level: 36
})

(:Dish {
  id: "DSH-52",
  name: "Dry-Aged Ribeye",
  allergen_profile: ["Dairy"],
  target_cook_time_seconds: 960,
  assigned_kitchen_station: "Grill"
})

(:Supplier {
  id: "SUP-14",
  name: "Artisan Wine Group",
  lead_time_hours: 48,
  reliability_coefficient: 0.98
})

(:Shift {
  id: "SHF-2026-12-14-PM",
  start_time: "2026-12-14T16:00:00Z",
  end_time: "2026-12-14T23:59:00Z",
  scheduled_labor_cost_usd: 1450.00,
  demand_forecast_index: 0.92
})

(:Incident {
  id: "INC-994",
  timestamp: "2026-12-14T21:12:00Z",
  incident_class: "FOH_Service_Delay",
  severity_level: "Medium",
  initial_sentiment_score: .0.72
})

(:Event {
  id: "EVT-440",
  title: "Vanguard Tech Gala Dinner",
  pacing_expectation: "Staggered_Rapid",
  labor_markup_percent: 20.0
})

(:Table {
  id: "TBL-14",
  table_number: "14",
  max_capacity: 4,
  zone_assignment: "Terrace_S"
})

(:Room {
  id: "RM-304",
  room_class: "Deluxe_King",
  housekeeping_status: "Clean",
  rate_pricing_tier: "Premium"
})

(:FloorPlan {
  id: "FLP-01",
  zone_count: 6,
  spatial_resolution_cm: 10
})

(:GuestComplaint {
  id: "CMP-08",
  complaint_class: "Service_Pacing",
  raw_text: "Entree wait exceeded 40 minutes at Table 14",
  sentiment_score: .0.85
})

(:TrainingModule {
  id: "TRN-03",
  title: "FOH Service Pacing and Tableside Recovery",
  passing_accuracy: 90.0
})

(:AcademyCertification {
  id: "CRT-12",
  title: "Certified Service Specialist Level II",
  governing_body: "HESTIA Academy"
})

(:ServiceStandard {
  id: "SOP-15",
  title: "High-Volume Fine Dining Pacing Standards",
  maximum_course_gap_minutes: 18,
  compensation_escalation_threshold_usd: 50.00
})

(:Decision {
  id: "DEC-402",
  rationale: "Increase Grill Station labor to resolve Saturday pacing delays",
  approved_by: "MGR-05",
  logged_timestamp: "2026-12-14T22:30:00Z",
  outcome_rating: 0.82
})

(:ReputationSignal {
  id: "REP-401",
  data_source: "TripAdvisor",
  aggregated_rolling_score: 4.62
})

(:Review {
  id: "REV-901",
  extracted_sentiment: .0.62,
  review_text: "The patio seating was beautiful but the kitchen timing was extremely slow.",
  publish_date: "2026-12-14T08:00:00Z"
})

(:Competitor {
  id: "CMP-04",
  name: "Bespoke Dining Group",
  distance_meters: 450,
  average_menu_price_usd: 48.00
})

(:PricingChange {
  id: "PRC-992",
  previous_price_usd: 34.00,
  new_price_usd: 38.00,
  demand_trigger_index: 1.15
})

(:OperationalRisk {
  id: "RSK-08",
  vulnerability_type: "Grill_Station_SOP_Deficit",
  probability_score: 0.72,
  financial_impact_score: 0.55
})

// REAL-WORLD RELATIONSHIPS & SYSTEMIC PROPERTIES

[:CONTAINS]
(Venue) .[:CONTAINS]-. (FloorPlan)
(FloorPlan) .[:CONTAINS]-. (Table)

[:SERVED]
(Employee) .[:SERVED {
  timestamp: "2026-12-14T19:30:00Z",
  actual_course_gap_minutes: 24,
  pacing_variance: 1.33,
  evidence_hash: "0x8fa3bc22"
}]-. (Guest)

[:COMPLAINED]
(Guest) .[:COMPLAINED {
  timestamp: "2026-12-14T20:15:00Z",
  channel: "Tableside_Tablet"
}]-. (GuestComplaint)

[:COMPLAINED_ABOUT]
(GuestComplaint) .[:COMPLAINED_ABOUT]-. (Dish)

[:CAUSED_OVERLOAD]
(Cocktail) .[:CAUSED_OVERLOAD {
  ticket_volume: 48,
  average_prep_delay_seconds: 185
}]-. (Shift)

[:EXPOSED_WEAKNESS]
(Event) .[:EXPOSED_WEAKNESS {
  labor_budget_variance_usd: 450.00,
  service_incident_count: 4
}]-. (Shift)

[:RESOLVED]
(Manager) .[:RESOLVED {
  resolution_type: "Complimentary_Dessert_and_Log",
  recovery_action_cost_usd: 15.00
}]-. (Incident)

[:REJECTED]
(Founder) .[:REJECTED {
  timestamp: "2026-12-14T22:00:00Z",
  rejection_reason: "Target price exceeds local market expectations"
}]-. (Decision)

[:AFFECTED_BY]
(Menu) .[:AFFECTED_BY {
  shortage_percentage: 40.0
}]-. (Supplier)

[:VALIDATED_BY]
(TrainingModule) .[:VALIDATED_BY {
  performance_score_variance: 0.14
}]-. (ServiceStandard)

[:AFFECTED_PERCEPTION]
(PricingChange) .[:AFFECTED_PERCEPTION {
  weekly_sentiment_change: .0.08
}]-. (ReputationSignal)

[:MENTIONED_PACING]
(Review) .[:MENTIONED_PACING {
  sentiment_score: .0.68
}]-. (Table)

[:LOCATION_AFFECTED_COMPLAINTS]
(Table) .[:LOCATION_AFFECTED_COMPLAINTS {
  incident_spatial_frequency_percent: 18.4
}]-. (FloorPlan)

[:CAPABILITY_AFFECTED_SUCCESS]
(Employee) .[:CAPABILITY_AFFECTED_SUCCESS {
  event_satisfaction_score: 0.94
}]-. (Event)

### **2. Multi-Tier Bayesian Confidence Model**

To evaluate the reliability of inferred or derived relationships, HESTIA's query engine calculates a dynamic confidence score (![][image20]) for every newly created edge20.

                .-----------------------------------------+
                | Ingestion of Multi-System Event Logs    |
                .-----------------------------------------+
                                     |
               (Sort Ingested Data into Validation Tiers)
                                     |
         .---------------------------+---------------------------+
         |                           |                           |
         v                           v                           v
   [Validation Tier 1]         [Validation Tier 2]         [Validation Tier 3]
 * Cryptographic logs          * Direct system APIs        * Derived AI sentiment
 * $w_{.text{Tier1}} . 1.0$    * $w_{.text{Tier2}} . 0.8$  * $w_{.text{Tier3}} . 0.4$
   [cite: 17, 29]
         |                           |                           |
         .---------------------------+---------------------------+
                                     |
                                     v
                  .-------------------------------------+
                  |   Confidence Scoring Calculation    |
                  .-------------------------------------+
                                     |
                    (Calculate Confidence Score: C(e))
                                     |
                                     v
                        C(e) .= Threshold ?
                                     |
                     .---------------+---------------+
                     |                               |
                     v                               v
             [Store in Graph]               [Queue for Verification]

![][image21]

* **Evidence Tier Weight (![][image22]):** Assigned based on the source's data integrity29.
  * Tier 1 (Cryptographic events, secure signatures): ![][image23]29.
  * Tier 2 (System integration APIs, direct PMS/POS logs): ![][image24]2.
  * Tier 3 (Derived AI classifications, spatial predictions): ![][image25]7.
* **Source Reliability Coefficient (![][image26]):** Adjusts the score based on the historical accuracy of the source system (e.g., a calibrated POS integration is weighted higher than manual employee input)2.
* **Time Differential (![][image27]):** Represents the time elapsed since the evidence was recorded (![][image28])26.
* **Decay Constant (![][image29]):** Scales the influence of time on evidence reliability, ensuring that historical logs do not overwhelm current operational state data26.

### **3. Dynamic Memory Decay Surface Model**

HESTIA's database updates relational strengths dynamically, using a hierarchical Ebbinghaus exponential decay model to balance long-term policies with short-term operational telemetry26.
![][image30]
![][image31]

* **Observation Velocity (![][image9]):** The frequency of observed transactions or events within a given time window26.
* **Semantic Volatility (![][image10]):** The rate of change in value between observations, measured as the distance between successive embedding state vectors26.
* **Hierarchical Modifiers (![][image32]):** Adjust decay parameters based on the relationship's classification (e.g., safety policies are preserved indefinitely, while temporary wait lines decay quickly)6.
* **Smoothing Constant (![][image33]):** Avoids mathematical errors if value volatility falls to zero.

### **4. Dynamic Human-in-the-Loop Validation Protocol**

To ensure operational safety, HESTIA blocks automated changes for high-risk decisions and prompts an authorized manager for confirmation6.

                 .-----------------------------------------+
                 |    Calculated AI Operational Proposal   |
                 .-----------------------------------------+
                                      |
                     (Evaluate Project Impact Score: I_s)
                                      |
                                      v
          I_s . .omega_F .cdot .Delta C . .omega_S .cdot R_s . .omega_R .cdot V_r
                                      |
                                      v
                        Is I_s .= Threshold ?
                                      |
                      .---------------+---------------+
                      |                               |
                      v                               v
             [Direct Execution]              [Suspend Action]
             * Apply to target graph         * Send to Manager queue
                                             * Log human decision

To evaluate the risk of a proposed action, HESTIA calculates a composite Severity Index (![][image34])6:
![][image35]
where:

* ![][image36] represents the estimated financial impact of the proposal6.
* ![][image37] measures potential risks to safety or compliance6.
* ![][image38] evaluates the risk of negative public feedback1.
* ![][image39] represent scaling weights defined by the venue's core brand policy6.

If the calculated Severity Index exceeds the defined safety threshold (![][image40]), HESTIA suspends the automated action and flags it for manual review in the management dashboard6. Managers can approve, modify, or reject the recommendation, and their choices are saved to help train future suggestions6.

### **5. Multi-Hop GraphRAG Retrieval & Matchmaking Query**

This Cypher query showcases how HESTIAג€™s GraphRAG framework navigates multi-hop paths to locate physical, operational, and customer relationships when diagnosing dining pacing issues13.

Cypher
// Locate the table experiencing service pacing complaints and trace the root causes
MATCH (v:Venue {id: "V-77"})-[:CONTAINS]-.(f:FloorPlan)-[:CONTAINS]-.(t:Table {table_number: "14"})
MATCH (rev:Review)-[pacing_edge:MENTIONED_PACING]-.(t)
WHERE rev.publish_date .= datetime() . duration({days: 7})

// Traverse neighboring nodes to locate the active server and guest orders
MATCH (e:Employee)-[served_edge:SERVED]-.(g:Guest)-[:ORDERED]-.(d:Dish)
WHERE served_edge.timestamp .= datetime() . duration({hours: 24})

// Map back-of-house kitchen station performance and raw supplier delays
MATCH (d)-[:AFFECTED_BY]-.(s:Supplier)
MATCH (r:OperationalRisk {vulnerability_type: "Grill_Station_SOP_Deficit"})

RETURN
  t.table_number AS TableNumber,
  rev.review_text AS ReviewText,
  e.name AS ServerName,
  served_edge.pacing_variance AS ServicePacingVariance,
  d.name AS OrderedDish,
  s.name AS ImpactedSupplier,
  r.probability_score AS GrillVulnerabilityProbability
ORDER BY ServicePacingVariance DESC
LIMIT 10;

### **6. Dynamic Context Filter Mapping (Privacy Layer)**

To protect personal privacy and ensure compliance, HESTIA's data layer filters and masks sensitive attributes before passing records to AI models6.

                      .-------------------------------+
                      | Ingestion of Data Query       |
                      .-------------------------------+
                                      |
                       (Identify User Security Role)
                                      |
         .----------------------------+----------------------------+
         |                            |                            |
         v                            v                            v
    [Role: Server]             [Role: Manager]             [Role: Founder]
         |                            |                            |
         v                            v                            v
 [Apply Privacy Mask]         [Apply Privacy Mask]         [Apply Privacy Mask]
 * Mask Guest Names           * Mask Employee Wearables    * Full Access
 * Mask Wearable Metrics      * Allow Financial Metrics    * Allow All Data

         |                            |                            |
         .----------------------------+----------------------------+
                                      |
                                      v
                      .-------------------------------+
                      |   Expose Authorized Graph    |
                      .-------------------------------+

The schema rule below shows how HESTIA restricts sensitive node properties based on the user's role:
![][image41]

### **7. Ingestion Pipeline and Deadlock Prevention**

To maintain system stability, HESTIA's ingestion engine runs a dual-loop pipeline: a real-time event loop for instant transaction tracking, and a scheduled background loop for graph clustering and optimization7.

#### **Ingestion Sequencing Algorithm**

To prevent database locks during high-volume periods, the real-time loop groups incoming data into category partitions (e.g., F.B orders, room check-ins) and processes them sequentially, while updating nodes in parallel within each partition2.

Python
import concurrent.futures
import threading

class DeadlockFreeGraphIngester:
    def __init__(self, driver):
        self.driver . driver
        self.lock . threading.Lock()

    def process_transaction_batch(self, batch_payload):
        """
        Partition incoming batch by transactional category to prevent
        concurrent lock contentions on identical nodes.
        """
        partitions . {}
        for record in batch_payload:
            cat . record.get("category_partition")
            if cat not in partitions:
                partitions[cat] . []
            partitions[cat].append(record)

        # Process partitions sequentially, execute records in parallel
        for partition_key, records in partitions.items():
            self._write_partition_records(records)

    def _write_partition_records(self, records):
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            futures . [
                executor.submit(self._execute_cypher_write, record)
                for record in records
            ]
            concurrent.futures.wait(futures)

    def _execute_cypher_write(self, record):
        query . """
        MATCH (g:Guest {id: $guest_id})
        MATCH (d:Dish {id: $dish_id})
        MERGE (g)-[o:ORDERED {order_id: $order_id}]-.(d)
        ON CREATE SET o.timestamp . datetime($timestamp), o.source . $source;
        """
        with self.driver.session() as session:
            session.run(query,
                        guest_id=record["guest_id"],
                        dish_id=record["dish_id"],
                        order_id=record["order_id"],
                        timestamp=record["timestamp"],
                        source=record["source"])

#### **Vector Search Isolation**

To keep semantic searches fast and relevant, HESTIA creates separate vector indices for each venue or property location rather than running a single, global index18.
When a query is run, the engine restricts its similarity search to the target venue's index, reducing query times and ensuring recommendations match local constraints7.

#### **Background Synthesis Loop**

A scheduled background loop runs during low-volume hours (such as early morning) to optimize the graph structure18. This loop recalculates Leiden community clusters, updates confidence scores, and archives or deletes expired operational records6.
Separating this heavy processing from the real-time loop ensures that the system remains fast and responsive during active service hours7.
By combining physical layouts, operational policies, and human workflows into a single, structured model, HESTIA provides operators with a complete, context-aware Venue Intelligence Graph6. This relational framework helps hospitality groups optimize resource use, protect guest privacy, and make more informed, data-driven decisions2.

#### **׳¢׳‘׳•׳“׳•׳× ׳©׳¦׳•׳˜׳˜׳•**

1. What is knowledge graph? | Why is it important? . eGain, [https://www.egain.com/what-is-knowledge-graph/](https://www.egain.com/what-is-knowledge-graph/)
2. Beyond RevPAR: Why PMS/POS Integration is Redefining Hotel Revenue Strategy, [https://www.hospitalitynet.org/opinion/4132867/beyond-revpar-why-pmspos-integration-is-redefining-hotel-revenue-strategy](https://www.hospitalitynet.org/opinion/4132867/beyond-revpar-why-pmspos-integration-is-redefining-hotel-revenue-strategy)
3. Integrating POS and PMS Data to Drive Hotel Efficiency | Agilysys, [https://www.agilysys.com/en/blog/integrating-pos-and-pms-data-to-drive-operational-efficiency/](https://www.agilysys.com/en/blog/integrating-pos-and-pms-data-to-drive-operational-efficiency/)
4. Knowledge Graph Overview . Yext Help, [https://help.yext.com/hc/en-us/articles/51455797837851-Knowledge-Graph-Overview](https://help.yext.com/hc/en-us/articles/51455797837851-Knowledge-Graph-Overview)
5. Hotel Ontology (NEW.) . Introduction and Terms . Brewer Digital Marketing, [https://developers.brewerdigitalmarketing.com/hotel-ontology/introduction](https://developers.brewerdigitalmarketing.com/hotel-ontology/introduction)
6. Enterprise Digital Twin Architecture: Implementation Guide for AI Systems, [https://ajithp.com/2026/01/11/enterprise-digital-twin-architecture-implementation-guide/](https://ajithp.com/2026/01/11/enterprise-digital-twin-architecture-implementation-guide/)
7. An Ontology-Driven Digital Twin for Hotel Front Desk: Real-Time Integration of Wearables and OCC Camera Events via a Property-Defined REST API . MDPI, [https://www.mdpi.com/2079-9292/15/3/567](https://www.mdpi.com/2079-9292/15/3/567)
8. Ai Hotel Schema Travel Knowledge Graphs Data Authority Single Source Of Truth by Agentic Hospitality in Louisville, KY, [https://www.agentichospitality.com/news/ai-hotel-schema-travel-knowledge-graphs-data-authority-single-source-of-truth](https://www.agentichospitality.com/news/ai-hotel-schema-travel-knowledge-graphs-data-authority-single-source-of-truth)
9. Restaurant Operations Management: A Complete Guide . DoorDash Merchant Portal, [https://merchants.doordash.com/es-us/blog/restaurant-operations-management](https://merchants.doordash.com/es-us/blog/restaurant-operations-management)
10. How Can Busy Restaurants Improve Communication Between Kitchen and Front of House?, [https://www.shiftforce.com/blog/how-can-busy-restaurants-improve-communication-between-kitchen-and-front-of-house](https://www.shiftforce.com/blog/how-can-busy-restaurants-improve-communication-between-kitchen-and-front-of-house)
11. Bridging the FOH-BOH Divide: How Smart Staffing Creates Seamless Events . Heart of the House Hospitality . HeartoftheHouse, [https://www.heartofthehouse.com/bridging-the-foh-boh-divide/](https://www.heartofthehouse.com/bridging-the-foh-boh-divide/)
12. Cafe vs Restaurant: Operational Differences That Matter . Blogic Systems, [https://www.blogicsystems.com/blog/difference-between-cafe-and-restaurant-operations](https://www.blogicsystems.com/blog/difference-between-cafe-and-restaurant-operations)
13. What Is GraphRAG? A Guide to Connected Context . Memgraph, [https://memgraph.com/blog/what-is-graphrag](https://memgraph.com/blog/what-is-graphrag)
14. An Ontology-based Hotel Search System Using Semantic Web Technologies | Request PDF, [https://www.researchgate.net/publication/264185135_An_Ontology-based_Hotel_Search_System_Using_Semantic_Web_Technologies](https://www.researchgate.net/publication/264185135_An_Ontology-based_Hotel_Search_System_Using_Semantic_Web_Technologies)
15. Ontology-based Matchmaking to Provide Personalized Offers . reposiTUm, [https://repositum.tuwien.at/bitstream/20.500.12708/5564/2/Gruen%20Christoph%20-%202016%20-%20Ontology-based%20matchmaking%20to%20provide%20personalized...pdf](https://repositum.tuwien.at/bitstream/20.500.12708/5564/2/Gruen%20Christoph%20-%202016%20-%20Ontology-based%20matchmaking%20to%20provide%20personalized...pdf)
16. Silverware POS: Enterprise Hospitality Point-of-Sale Platform, [https://www.silverwarepos.com/platform/silverware-pos-overview](https://www.silverwarepos.com/platform/silverware-pos-overview)
17. A Guide to Restaurant Operation Management . Encore Seattle, [https://encoreseattle.com/blogs/seattle-restaurant-equipment/restaurant-operation-management](https://encoreseattle.com/blogs/seattle-restaurant-equipment/restaurant-operation-management)
18. Scaling our existing tagging system with Hybrid Graph-Semantic Search | by Tripadvisor, [https://medium.com/tripadvisor/scaling-our-existing-tagging-system-with-hybrid-graph-semantic-search-2322bdaa5b8d](https://medium.com/tripadvisor/scaling-our-existing-tagging-system-with-hybrid-graph-semantic-search-2322bdaa5b8d)
19. 6 Business Benefits of System Integration in Hospitality . NetSuite, [https://www.netsuite.com/portal/resource/articles/erp/system-integration-hospitality.shtml](https://www.netsuite.com/portal/resource/articles/erp/system-integration-hospitality.shtml)
20. Digital Twin: Graph Formulations for Managing Complexity and Uncertainty, [https://kiwi.oden.utexas.edu/papers/graph-digital-twin-uncertainty-Huang-Kapteyn-Willcox.pdf](https://kiwi.oden.utexas.edu/papers/graph-digital-twin-uncertainty-Huang-Kapteyn-Willcox.pdf)
21. What is GraphRAG? . IBM, [https://www.ibm.com/think/topics/graphrag](https://www.ibm.com/think/topics/graphrag)
22. What is GraphRAG? . Neo4j, [https://neo4j.com/blog/genai/what-is-graphrag/](https://neo4j.com/blog/genai/what-is-graphrag/)
23. Welcome . GraphRAG, [https://microsoft.github.io/graphrag/](https://microsoft.github.io/graphrag/)
24. Your AI Has Amnesia. Here's Every System Built to Fix It. | by Alan Ayala Garcֳ­a . Medium, [https://medium.com/@alanayalag/your-ai-has-amnesia-heres-every-system-built-to-fix-it-ad7dee117a75](https://medium.com/@alanayalag/your-ai-has-amnesia-heres-every-system-built-to-fix-it-ad7dee117a75)
25. Not All Memories Age the Same: Autodiscovery of Adaptive Decay in Knowledge Graphs . arXiv, [https://arxiv.org/html/2604.26970v1](https://arxiv.org/html/2604.26970v1)
26. AI memory is broken. Here's how I fixed it with a temporal knowledge graph. . Reddit, [https://www.reddit.com/r/AIMemory/comments/1oucp81/ai_memory_is_broken_heres_how_i_fixed_it_with_a/](https://www.reddit.com/r/AIMemory/comments/1oucp81/ai_memory_is_broken_heres_how_i_fixed_it_with_a/)
27. The Ebbinghaus Forgetting Curve (and How to Beat It) . e-student.org, [https://e-student.org/ebbinghaus-forgetting-curve/](https://e-student.org/ebbinghaus-forgetting-curve/)
28. Tributech . Industrial Cyber, [https://industrialcyber.co/vndrs/tributech/](https://industrialcyber.co/vndrs/tributech/)
29. Knowledge augmented causal discovery through large language models and knowledge graphs: application in chronic low back pain | medRxiv, [https://www.medrxiv.org/content/10.64898/2026.02.13.26346255v1.full-text](https://www.medrxiv.org/content/10.64898/2026.02.13.26346255v1.full-text)
30. A causal discovery-based adaptive fusion algorithm for multi-source heterogeneous knowledge graphs . PMC, [https://pmc.ncbi.nlm.nih.gov/articles/PMC12864826/](https://pmc.ncbi.nlm.nih.gov/articles/PMC12864826/)
31. Temporal Knowledge Graph Reasoning . Emergent Mind, [https://www.emergentmind.com/topics/temporal-knowledge-graph-reasoning-tkgr](https://www.emergentmind.com/topics/temporal-knowledge-graph-reasoning-tkgr)
32. The Forgetting Curve: Why Learners Forget (Ebbinghaus) . Structural Learning, [https://www.structural-learning.com/post/ebbinghaus-forgetting-curve](https://www.structural-learning.com/post/ebbinghaus-forgetting-curve)
33. Causal knowledge graph analysis identifies adverse drug effects . Oxford Academic, [https://academic.oup.com/bioinformatics/article/42/1/btaf661/8378293](https://academic.oup.com/bioinformatics/article/42/1/btaf661/8378293)
34. Structural Causal Models (SCMs) and Do-Calculus: In-Brief | Rehan Guha .Portfolio & Blog, [https://rehanguha.github.io/articles/scm-dowhy-in-brief](https://rehanguha.github.io/articles/scm-dowhy-in-brief)
35. Do-calculus when the True Graph Is Unknown . Computer Science, [https://www.cs.helsinki.fi/u/mjarvisa/papers/hyttinen-eberhardt-jarvisalo.uai15.pdf](https://www.cs.helsinki.fi/u/mjarvisa/papers/hyttinen-eberhardt-jarvisalo.uai15.pdf)
36. Do-calculus: A Comprehensive Guide for 2025 . Shadecoder . 100% Invisibile AI Coding Interview Copilot, [https://www.shadecoder.com/topics/do-calculus-a-comprehensive-guide-for-2025](https://www.shadecoder.com/topics/do-calculus-a-comprehensive-guide-for-2025)
37. How Willow Copilot Actions Transform Work Order Efficiency, [https://willowinc.com/how-willow-copilot-actions-transform-work-order-efficiency/3131/](https://willowinc.com/how-willow-copilot-actions-transform-work-order-efficiency/3131/)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG8AAAAZCAYAAAA/vnC8AAAEyUlEQVR4Xu2ZW8ilUxjH/zKKTIzTDOGCiymZKGZohCJNyiE5jcJcmhrMjWbE1XcjcSXJhUSSHFJuHEu8RTmGC6ebySGHUERRyOH5zbMe79prr3d/3947M33T+te/b+/1rsOznv+znvW8+5MaGhoaGhoWxUrjMcZV6ft+xoP7x8sHFxi/NH5qfMS43bhipEcPNnmDvB9jIOP3FFjvG+MuufNnwVPG3+Rz/Wg833iV8YG803LBscYrjb8Y/zb+ZFw30qPHCcZP5P12yMcxfloQ+XBa3Ci37wvNJt5q42PGQ7K2j+X7ISCXLTrjFvlG3hx9tBsHGR80Xm38VbM5L3Cv8daycQlA8E6ziUdafFnj48gm92kfEO8kuXAIWGKj8W7jes0n3hHG97TnxYuxtaxyufYB8XAITv1HHpE5FowXGk/XsHgHGNfIn5GiSuxvvE0+/yTxYh7mYEygFO/A7O9ioM9zGk+b4GjjpqIN4APmn7RG7HfoGiBY2QN7OjJ9LsF45qHPTOjkkxCZ3CvcbzkeNh6qYfHYKAXAE/LL/33j5tQe4DnC5cwjnr6MYX3Gv2H8wXhOep6Ld7K86PheninuSn0m4Rr5mn8ZXzFu1XiQBtYa35bb97TxD+Pt2XOukZ3GJ1MfCqmHsudxCLD1ZuPn8r18mPU5XF5AMf41+b4vzp4vGZ16Qdjki3IDAdVnpJsh8XAsxp2atf0pvydzxKZqJw/j3zEelr5fL68Mb5E7OcRj/E2pD4g5l4KLjK/LBYwA4vMV6Tl7Zu/YfnZqQ0iq8RfS9+s0bgO4VJ6hAthLv2vl9l8mzzyg5gfWY92p0akXhCOcV50nqk8bQ+KVIAXg+PxkgZrRAdpLsXOEeKyPHYFpxAtgH6f3Z/lY7vo8s/A6gh9KRPrltJevSYz9SJ4eAfbigw3/9ejbO/m6FImRmgn8r9PzqdBpVBAmXkift2Xtk8Q7y/is3GDSRa0EX0y8WntgHvGI/DjROc6QB2qctEvkc3WqO5F9s7fSBhC+iXbG1/rFHPjnGfk1k3Pofh1Ep1FBfpensOPl911gSDyilk3fr74goB/3Rf7Sn4vH5R0XOvg/xWNsGUgAUdkf4xFuqeLVTtS04tXmmAmdRgXhO5Fxh/wVITAkHvkfJ+QVE/0641HGM1NbLh5z8Dzmop1qEIfWMK94z5eNCYyPNLhRHrhfGY/LOyXkKQ+hc9TSZmkriNTLHLymzIVYhJ/GOEGAe+5b9XcBwKm8LpBiTkltgVI8xuAQqiic8nhqD+fwfZ38NESaoHpjQ4/KX6pZb0cinzmlVKBE7LlpDKd2QT5uUqkdTr9Ho79jbpL/usTaETSRSrn3ArRRGQLWIb1xegII/YF6XwHsxdbzNB6QMQfFUjzDrlp2GESkiZy0kepwMKKAiO6SEX1UaYhFiY8BpNwQIy/3MZqynr5vyV/6A2xis7z8pzSnrL5TvSi1tQm6sq0GxHtJXhDhUH5tCedhTyn8WnmgsA9eK17V6ElkvwQVNr4rDwB+OQrU/FXaFnN8J69wP5NX2HsF8dK8Wv09RiSWjgH8oj90MTOWOYaezwKC8bT0eY3ckfw2y50+Cewn/vtQA3PRZx5bmQPW/NTQ0NDQ0NDQ0NDQ0DAN/gUNB0J1DVTgCQAAAABJRU5ErkJggg==>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEwAAAAaCAYAAAAdQLrBAAADxElEQVR4Xu2YS6iNURTHl1CEvEnIJRPyDHlEySMkkhQhmZmYCcVEycDAMyZSYoBiIolicGRADKSISCElhBKK8li/1t5s6+7vO/e456pT51//umev79tr7f9ea+39XZEmmmiiiZrRxw/UEd2UPf1gI2Ol8oIfzKCzcpByiPwtcCdlj+S3xzDlNT/YqECse8oWN54CoZYqvwe+VH5SjhUTa4ty/++n8xgt5quhMUL5ULneGxJME3vmp3K8mHgAoR4rzwXbujBeBubBZ8Pig3KzHwxAEIRAlKJFUmpkW0Xa1qPwhc9x3tAoeKcc4wcDFiq/Kud4Q4JeyhvKw95QAHzhc5cbbwVOCRplytg02Zk4RkONKd/RwC+LZdEexHFfeUQs04rAu9eVy72hAFHgilTJyGVi6Z3yZLBtT8aeiwn3PzBKedwPBlA6xDPTGxxY9BplP28oAet+Jea/Kt6KBZLW8XDlE7Hd7AiQyYOVXd04m5hr1LFsiLMjsElsbvxXBaLEbIoCsZuflVPiQ3XEUbEdvas842wEnAt6gfKH5AVDdMT37aW/WOmyAfN/P51HrLac71Ygq8guXiDbYq9gMV2S5+qF28qByn3Knc5GKeWCTtuHxyyxanih/Cb2zBvlITHBsHEnK0NNgiEK4sSANii/SPlJ1B5cEjtwcijKMDKdjM8JloKTsWz+InB5bbNgoLvyothLpP7ixEY5cINGxBNil8KnyiXBHm2nxMqMexDz7Q1j7PDU8OwO5UexU2xtGEuBMHv8YABZQnyUWg6xUogXUKrMdV4snjLwHHFN9IYyIBJiVaT18cpC3itXh9/cwvk9OdjYffoenyoIxil7RSzQjcpbyt68KPn5I+hFLDDXCpiL3sf3Hz5S8Dl0R+wTaWgYW6VcIbZhzFsEfOHzgXKAs5UiZlnu/oIo9Ih4CMTbNDvD2Gvl7GDDKc7JMJrvIrGrSdy9ihQLRvBlgRNj7FMIdEz5SOydecrp8kdsyox5qt3bEPiZVH+uJnjBWHBFbMe9DZEQaHf4G6ZXiIoUCwbIklhWOdCf5oodEJyALVK80JHyd3vJAV9sQrXnaoIXxWdYausrtvtFnyYVKResLbf5toL7FSfyBMmXOcBX2jLqglh2p8VEogwoAcARTonQ086GMbJpq1ipcHOPu8e/W+K/YoqyiHcpNQ4Yf7GtBQh+UHlAisWIvtrjJ4s0i2r5tiSQfwmGBV5VbvOGGoFoRbFiY/4iMdsFX3b/A/y3lOzoKMyQ4rbRLkxSXhYru5vO1kQTTdQFvwCXo8hrFONMlwAAAABJRU5ErkJggg==>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAaCAYAAACzdqxAAAABa0lEQVR4Xu2UO0sDQRSFj6igxEZ8poul4AsstBO0iIWFiJ2IpaWFoD/Av2ApiIWd2AnaWStYiIWghVrYCoKFgo9zuDM6zmZlQlJJPvjIZm72Mnv3TIAGiTTRLlqkHcF6Ky0E35NRwwn6Tj/pI32lJdpOd+iS/3Eq/fSQftBh2uzW9XlBT+gzHXXrSYzRB/pEy1FNbMGe4Jx2RrVczmA3bcBGUQnN+h5VjkFNr2hvXAhQY21gMC7kMQBrvBkXItR4EfYCk1ilL3Q8LtSC8nlK95GdrZKg0WinoT7TmvWMu87gG+9F60Jxu4Ql5Q0/mV529Ru67q4ztNADVG4cokOxi+xT/Yle2jHyX4oyq+xWFTOPjq8eeRK/d1WCRUwn0R8KJWMeNoo+t5bLFL2FzfEONhrt8ppO07nvXwILtJtuI3E0SoHCrx2twHabd6OyPxsv1gNlv4eOwAJQF9roER2ia1GtZjQi/5fa4D/xBY/NODY4r+hLAAAAAElFTkSuQmCC>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAAAaCAYAAADygtH/AAADs0lEQVR4Xu2YXahNURDHRyhCvoqE7iV5QRGS5EUK+Ui8KB+vJCKKeFJSCiURyYsHUZQHCeVhh6IolFI+8pEoilLUJR/za/Zy9p17ztp7n3uTo/2rf7e7Zp9z1po1a2bWFqmoqKhomr6qYape3tCDDBb7nf8CFnNRtdIbGjBKNULV2xtyWKy67gdblSuqXRKPsnGqY6rPqteqj6ofqiPZhwqwRtXmB1sNHHVHNdwbMhwQc9B+qT3H5xaoPqkmpGNF4HieTP+2JCz8qGqkN6SMUd2V+LEdqvqlWuYNEa6m6u8NrcBo1Us/mMKCLok5JHZs+4g9c8obIqxXdahme4Onn1gCzWpIahuYGWsmwTYL0cGC67FBzPbWGxw4lOcui62xCDNVX1U7vcGzVOzLszqd2vhwGHsl5ry/wT6xxO7huD4Wmw/HNwYbXtZprI91XhCL1Fw+iP0ICXRyOjZW9VTyJ9iTsNhELGd5qIjM8Z1qvLN5QrSu9oYIOBcnFw4QHBOiKjhpk+qLanp46C8QnIY89FLM76ZqkLNlCYXkjVhLEtghVkRicMoKO43oIsqYFFFHDnukOivFQpUdneLG5qcqAw0trUbixiERmx9/cW4jaDXIeXulc7Ggh5uW+b8epZyGY3BQiLZ1YklxbvahCOQ/H5E4kpxZhliknZF8p+Gkw2LPsfFl4LP8RmGnQbac/1Qt7GyWFaoHqrWqG1IL9Tliz78X68qJrtti38PuMjZAdT4dI5KI5q18uA7sNnnLEyKo3txghtj3cmKyEc6zOINAiEFvRy4lDTDfwvADTCqRrrt5SPVcrIpRYcgbIfxxTDbSQiXykYZDqIA4cLOzBbapvvvBFBpabgFP3DjtEPn3vmpiZnySaovYPPntGBQXNqvsFexPtNXrpJkY1wyqDPkikZpjyzgNh8eguezwgyksfolYVJ9QrRJrUZ6JpQN/DSK9MBfmmdd/sWY2pF4UNw07eEvsqsG9L5HmnJa346EYxPorNhCH4ajlqvZO1q4QRXlFiQjjFDS6vpWGC/FDqVUkdjcRq0a87wpOw1k8k3Uajg3OLeI0oPOnovcUiyS/3cBhe/xgd6C67la9UG0Uy0f0QbzvokodF4tCKhcJGcduF8s9B8US6znVN7EjkLfrQP6c5QebIFTkGO0SfwHQLTgyjUo5d1Z/pLJRVhYWQXS3eUNJOJrkvEaQDq5J/AVASzFPLBUUabA93BwoBLxgpKo2gpsCbVSFWL9Gcr+nmupsFRX/OL8BuKrHpwOTKbsAAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAbCAYAAACX6BTbAAABc0lEQVR4Xu2UvytGYRTHv0IpIhIpJYtJIkbJYFIsFqWsFvwBdqNFyihJpAwGKZNRlEFZbGQz2CQJ32/nfetx7vU+997u+H7q01vnvOfce8/zA6hTgGbaS/tom8sVpoFO0Xf6TF/oF70J/1SEfnoGa9oYxLvoKV0IYrkYhTW9hT3E00Pf6JhPxJigr/SRDrhcyA/d9sEYKrqmHT7h0P+eYIuciUFY0apPpJC7+RJslsM+4dAuUnOtSafLpaKCQ2Qr6IY134PVRdHhuII9IFYwA2s+H8RG6BrswCWoNt93cY8evIPkouulLlHjBG/Sc9riExVUqAZ669jXJRjH/wuqz92l35XfML5B7+hQEE9Q3QXHtDWIt8PG9UHX8fc6WKaT9IHOBfFUtMd1UWkPa0zanp/0BHYOQjS+WdoEuy705VFUNA1rvIgaixSgN9cWLR2dixUfLAuNI9NIiqDxxU51LtTwAnZxabFLZYve0wN65HJ14vwC+6U/7Y2aO04AAAAASUVORK5CYII=>

[image7]: <data:image/png;base64,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>

[image8]: <data:image/png;base64,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>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAaCAYAAABhJqYYAAAAm0lEQVR4XmNgGAX0BoxAzIwmxoHGBwN5ID4CxFegbBAQg/IVYYpAgAeIVwCxGRB/A+IiqDhI0RMg9oTywQDEMQViTiB+AMTSSHKSQCyOxIcDYyCezwBxOwxoMuBwdzoQR6OJofPhYCEQ6yPxQc5aisRHAQ1ArANlCwHxciDWhsuiARkgfsgAseEkEDuhSmMCYQaI71nRJUYB/QAAWh0QRxedrfYAAAAASUVORK5CYII=>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAZCAYAAAABmx/yAAAArElEQVR4XmNgGAUjDfADMSu6oC0Qq6ALIoFiIP4PxAeQBVmAeBmyABYAsmkVA5pGTXQBIEgD4hVoYuVAPAdZIAiIW5H4gkB8GoivIomBAEhNNLLAQgaIaTBgDMTPgNgSSSyGAeIdkLfgAGT9IShbCIh3MkACogyIGYHYHYifA7ErVA0cpDNAFD4B4r8MEEWPoGKvoPR0BjTbYIAZiIUZIDbAAAcQCyDxR8EwBAD9Khx3bwJ4hgAAAABJRU5ErkJggg==>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAaCAYAAAA0R0VGAAACaklEQVR4Xu2WT+gNURTHj1CEJEqiRCilKLKQrCgiWVgoFsrCio2wFdnLhn6ULCR/FkpiYcFOWchCSdSPxEpKsZE/34977++dOWbmzdMji/epb2/mnPtm7j33nHPHbMT/w8xoqGGadRs3VNZIi6OxBsY8lNZFRxvbpMvSc+mNdEsac1ohTZoYXYUXPo3GFtZLL/JvJ1ZKu6Ur0g9pf75HB7LthjQ7jy9Mla5LZ4K9wMQ3WHVhXJ+S7jtbJ85amkjkkiX7OWmKs2+R3kmrnK3AQh5Jr6T5wbfE0g51Zqn0XvoUHdaL6GNpTrYxoY/S3jIogJ3/HI+OzFZpczQ2sdN6E4i8teQ74mwHLS1ktbN5LkpfpY3RkSEYp6OxCQYyAR7qIa/KlnJdoIDqtqzkaFRklnTHUntphd7zwNJDDkvLpV35+qW03apJXcaj2Le4XyB9kW5Li/J9hNx9Js2Ljojf0pJTsC/bfcSAl722FL06WEjblhY+WOoUrTRt6Vrps/2+8n6TY4Hj0sJgj/Bs3tGI39JYeVTTdxt8chTJTau2nTooNLa9Ed9CYuWViMakJzKkAI10RvABi/QthEZcBwuMC69wwdIEOAF85XBNNeEjutOla9bbBhp208pJD8aRq+et2oIKFEJMowmIEtGKJX/VjSGhyYtDlh501HpVSxF9s/pGysF+V3oiHZMmV92/YPIxjQZmrqUzlof5l5Ds49bcSNmu2GY8NHGOsb8CEeTA5/yMHwT9IEXuWfOXzlBYZinv9kRHH/hgGOjg/1NI+hP5tx9EihykSLqMHwq8aEc01rBJOmn/cGIjRnThJ7/bezDE/qgcAAAAAElFTkSuQmCC>

[image12]: <data:image/png;base64,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>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAAAaCAYAAAAAPoRaAAADKklEQVR4Xu2YS6hNURjHP6EIISKl3DAgRGFASskzMWBAKUwkpRQhZXBLZgYSJckjSclEkjwGt5RIeQykRCGPGBBFIY//7669Ovt8e6/jnHNxDM6v/t32t/Zde31rfY91r1mbNj2lnze0iMHe0Aw4M0oakrMNknrlniPTpMve2CJWWg83YLT0VXohvZMeS3Ol01Kf3HswRrovLXD2VsHhXLUmN2CG9FYakD0z2aLMtjW+lNFXOivtt/KIaBU3pR3W4Jo48YcWnPF0SnOcjdN+JU129lazWnojTfIDKcjn6xZCnU3wLLNiyL+X1jjb/wAnflB6IA13Y6VQ3J5JP6X11UPdTPQG8VGa6o0ZvTPlGWoNhmIdpHKbQ/lmxWgthep+0YLzaJs0zooO5HkijfRGC9X/jvRcmpLZiBrmJSQb4ZFV5vDg+Bdplh8QM6XP0kY/kGK59N0qG4A+SKuseGIDpa7sZ54R0iVpgoWP78zsLJT54nM9UFD3WPHbEdKTOUlJz1jptXTAD9RDh7RF+mThA0erRkOanHQ2WGchRdgUPs4iIlek+bnn3+EXzjeXOttdK0+9mMZE829J3dA2W3DeO5pyPkIonrPqInneqjejFhRg2mge8tiHMXNSSzzR+S5nL6UsdAA7zpedQi3nCW/fCU5YsWOkYJO886zBt9WytgzReS5mNWGXU87jwA9psbOz29eschnKE4unD8dGit106Z6zsdn5zRtm5cUOovO1DqibFRZ69uycDadOWai2XGHLSN0JgFPCAegvHcqNRRgnqo5bsajRn+nTXKK4YvPeLQvXbroIP1lzCmoLxXuJH/Cw0A0WqvNt6YiF6+wNC4UvBZOnChibwhyEHSe4tnq4GzoAcxBBvmvAJgtO4+h2CwcSu9BLaV7l1QKknS+4BejjMXSYfKGFUO+w4ml4nkp7vTEHYUn4pYopsDgirCx9wP8+c3K3oA2miGl3xuqvMQ1DseGPiNQtqx6oJfu8sYdQFLnb+zr1RxlvIe8bKWSeY5YuWs3CoVywUGv+KoRfp3TY2eslFe7NQhTyD41/BhuwyxtbxG5vaNOmTRv4BbEFiyJptQB2AAAAAElFTkSuQmCC>

[image14]: <data:image/png;base64,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>

[image15]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAbCAYAAABFuB6DAAAA6UlEQVR4XmNgGHSAFYjFgZgDXQIGGIE4HIifAPFmKI0V5ADxcyA2g/KjgVgRIY0Av4E4A4lvzABRjALEgPgUEAsjiYEUtiLxwQ6/DpVABkVAPAlZwAOI/wExD5IYyGNLGSCK4QCk6z8Qz0LC84H4NRC7wBTxAvFhLApBwQOyRQmmUIYBEl5vYQJQkM4A0cwCEwB54CsQn4YJMEAk1zBAFMIBTOFCJDFQwIMUxSCJgYPmLgNCoSwQ32aAuBMU53AACoYpQLwDiDmBeA4Q7wFifmRFMCAPxBeheBUQC6FKowKQNQLogqOAugAAtUQqyX7djEkAAAAASUVORK5CYII=>

[image16]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAZCAYAAABZ5IzrAAAB40lEQVR4Xu2VvStGURzHf0IReY9EKZsJGSzKYqAwMFBGyW6gDBYZvYQMEqEYSCRCkkz+A5NB2cWq8P0+557n/hzPvR3Pk8nzqU/uPefc69zfy3lEsmT5W7rgLsx1JzJgGC65gz4UwD3Y5k5kQDk8h03uhA+N8ApWuRMZwI87hsXuhA/9cBPmuBMZMA7n3EFfFuGYO/gLKmC+uueH7cCe4L5MTFlE0gtf4BqsFJNr5rwe3sGGcGkspfBIzHPP8BoWwQ54IOEmPuETrA3uv8Hdv8PJ4Josh9OJ3M+r+zjYRSuwG37ALTHvnIBTah3HH2GNGkvSDk9hoRobUNf8ilvxK8ZR2CLmH3JD3BjZF3OMWPrgmaRIW56YxfZBwlTp1mwW/w1ZmK4HCSPA1NWF04lo6Ygl4QMMnc7liLpm1C5gqxrzgTWio8wOszCFC8HfH9gI8dwhXLSurllXrC/7MDtnBnYG91HoDTEtLGrC9wyJKf5ImJINMdFguk5giZjifBVzJlm49g3eS/xL2bE3YtqfHccDlu/nx1yqdbHwS6bhrESEU3EoES3rwHeuwmpJ4zfRpk93QxTbkqJDUmB/E9OCYWX7625IBaPH88YH1iZLIC1YeDzeGak4BsX/CLC/iVmy/E++ACijQsBJCUI/AAAAAElFTkSuQmCC>

[image17]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGkAAAAaCAYAAAC0NHJVAAADOElEQVR4Xu2YS8hNURTHlzzyjPJKSAyUR0miyNCAxEBKUigTEzN5zQy+gZkYKJEkKY+kKAODGwOPlJTHSCFShCgzr/Wz9ursu+89596Pvu/cL/tX/+45e5+zzz1r7bXW3kckk8lk/muGqSaH30wPslB1T/VEdUk1sbk7UzdrVO9UO1VzVW9U++MLMvWyVPVZdUY1UjVe1QjiONMD/FJdUI0I51NUT1VfVUv8okx9UHdw0saobYHqo1jKmxW1Z8oh48xQjU47EiappqWNnViteqmaGbWtE3Mc0URUZaqZL2YvFwuvdHW8VfVWrP+T6rBqTNMVFfSpPojVo5NBD8UGuyxFChzqjFOtV23uh1ZJq7FTcNAz1WKxxdc1MdthT54JZKsvqm1iNR8OqI5H56UQnq/EBo8h1X1TLUvaeShL87NJ+0DBC/AynQxVF5SFc9IaEfzfH2LOei4WOe3AsdiyMkWyKGBxkNYdBr8prQ93BstJ01UvpJiRvcYGsUzUjoNSpL+9SZ9DKSHyeM9SiBQiZkLUhmN+qtZGbSmD5SSg0PYqOOlQ2hiYqnos5iS2N+3ASTfEMlopvoqL685K1UWpzpWpkwhXVizDk/Zu8U9RA/k5apFY7Y0LfCddV43l5hKY5Kelfd3eovouRdqb09z9B+6/Ih0yBQY5KhZuHO+T1vxJ+20pPhHhPHeS3++GZZxH4ZgUSr07Fc65ByNhrOWhz/dgzDQ/Jn3EaZaZ6htqH9MnEGOmE2awWaG6H51jcOootvRJy8THUSwedom9BxF0S7r89EZY3lXdEftux2olBsOnn4fcMPPEPiU5OOu82MzyRcmm0Mc9DTGDM4Neh18YJWZ4nrVdmsOfZ7uTfEyHMXnRumHSvRfbVxI5LBZ84jrHQp9HKeeVEZRCqipLNRiyzEle02Lo840dBiVve3sj9KVOIr0+UO1Q7ZH+OakRndcJ9uP/VdVQn4iVNehvYJNb5iSvaQ4R5Hurbp1EPYtrIHsJZqZvroeKk2qF6LoqhRHJoe4knHEiXAOzxXbb0K2TWOH4Colxjqh2S3FfdlI/wFCeEtPN17+u7pgA3F+1osxkMplMJpPJVPEbRbWpP7/hjZcAAAAASUVORK5CYII=>

[image18]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAZCAYAAAAv3j5gAAABHUlEQVR4Xu2UsWoCQRCGJ0gKQVASG3sRTCWks7BKoYWNjYUP4Bvo04iksBEbu1QilkmboGVsBRtBCwPqP453zK5G3eZAvA8+Dmb39p89do8o5BZ5gGkYsQcukIB5+GgP2HDAC+zDX5gyRv/nCXZJ3mnBOSzpCRruIgZf4RJO6bqgItzAuqol4Q/8gFFVN3ANapMEvakaNzwk2VlW1Q1cg75I5vN7mne4hWWr7uMaxPPOBTWtuo9rEM8NJGhBAQUF9ulOHQa+jx2SoIqqG7gG9UgW1BfUO952Az7cCV/APziDOXN4Dy+qj+0z/IQjGD/UqnB9eB7B3XuLaIckHXp8wwnMqBpfyjEcwBpcwQa5/yuvgn9hBZIg3mVIyD2xA2v9UFrDJCNuAAAAAElFTkSuQmCC>

[image19]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEkAAAAZCAYAAAB9/QMrAAACi0lEQVR4Xu2Yu69MURTGl7iEXAUhHoVkIiIRRCEKlYpQUCmIhI5EqSD+AIVEIiQaJKIS0UgUGokpRKOQSDQeBY1KoxAKj/XL3iuzZ43z2LPHNcb5JV/OzFp7znz7m33P2eeKdHRMmnWqDfG4xPVmEeaYPd/Xqtuqq6recGsm6UmYL/PeNdyq5oFqhS8qiyUkvla1yPWa4HzboybBRl9owLzvkeDfgz/mXRTSXtUb1YuoV6rdQyOquab6rLoXdUm1fGhEe5apjqnu+EYD5v1GPHrvxSHdVX1UbUpqW1WfYq8OfrmLrkZo32KvLSslrABWxHlpH9KcBI+pdzDv9KE4JE74XLUqqa2RsJoIrw4COe5qp1U/ZTS8tuSEZD9m6h3Mu4VXHBIT6rsar6nRq8LGHHJ13vO5x6p512tDTkj2Xf7y0Y/1g/H9XwuJC+V7qQ6JX5MVmUtOSIytC4lVDVMbEj3G5DLJkOhDF5J0IdUy9SHZmKqQ+jJqvg05ITVduM1bcUhsBP1FluecdxJur3XcksHF0TgrwSDbg3HICWmnBP/+BmHe2SJAcUiHVd9VFyQ8jiBeU9sXx3Ar55bO5LfEGnAeDPWSGu8fymDXzW2Yz6GmzSk77iuq+zK6OiwQzrM0qePfvAPH1DsUh8RJz6i+qG5G8fpE7BmsmK8yav6Z6q3qVBRhrk/6XJeeqn6oniT1FLu2/E62qvheQsZDCh7N+5F49N6LQzJWS/gb3i95m0AeJfhydt5HpfrhmN1v00oaF/N+UoJ/z8RC+tMcUF32xQVi6kNiZZ1TXZfBA+dCkx3SI9VmyfxPXQGEtE3G//dJKcyR+TLv1iG9VH2Ixx2uN4swx/9pvh0d/wK/ADf1xKZhlTZzAAAAAElFTkSuQmCC>

[image20]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAaCAYAAADBuc72AAACe0lEQVR4Xu2WTYiNURzGH6GIRiIfDZkplO8pzc6wYcnCmMXEzsLGymImOyULNWlqJE2kWShJykIhCzUWomjKVxmFBQtJKQujiefxv2/3vP977nnfe3VlcX/1dLvPOfe9z3vO/3wAbf5/llDzvZlA/f+aOdQyajW1OPAVZFHwPeM4NYbGgt6iDnqzLAp4m5qlflEfqR9UF7WQukQdzjoHPKFWeLOAddQU1e8bilhF3YS96TZqbsXX51PqLvWN2lHxM9ZT+5xXliPUK1joUvRQH6jvsFH1nIaNsEZuaeCr7yhstJtBdfoI9oxCHsNCnEQ8pFCtvkfttKs2PzmvUbZSX70ZQyGfI11jCqoX2hR4C2D1fD/w6rES1j+GZkgzNc83hHTDgmpkUijoIeSnOBtlLbAYmp3dsBe8Q32mzqJ2Z1C/q9Ry5+c4BqvLnb6hBPqNfjvsG2BhRqif1NGKt4F6idrFKM4gP1s5tD8+gL1NvdpMsR82G/r0aPS+oPrnfbCdYwjx/9LL7vVmRhZ0wvkxrlEdzksFlT8D20mkc9RmxEMKBY095w8q3hsoF/SUN1AcVNNZFgXt9WaIFpEKPbUPdlFrvUl2wWrwhG+ABfVbWQoFLVwnOi7fUtudr6mapAacn6FV+gJW4x6dNtdRXeEqmwsVz19Gsm0udofIsYeaho3Ca+oybHU+pDYG/TyqtyuwsB6ddG+oZ9Q4rE4HUT2WQzqpd96shx6gFaq9UjWnDboMB2CXlhh6pg4R7bcptNp1h2gpCqJTrVk0K+dh66Tl6AakE64ZtsDKotnbV8PcQ+P3SvXXIvKLq6XoLnuRWuMbEuhq909DtmnTCn4DbcNqvW40d+UAAAAASUVORK5CYII=>

[image21]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAABvCAYAAABRnpyiAAAUu0lEQVR4Xu3de6w0Z13A8R/xEvGOqIhg3vclFS+gaMAiClgqBYwRjVW5eMGoRFGISoOmxD9ORaMoVrEghIutJmDVRjClQfF2gkSpEFFTU1MxVFM0atRIkFBN1fny7C/n2WdnZ2fP7tnb+X6SJ+fszO7M7sw8z/N7LjsbIUmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJJ1H7+zSQ9uF0oHjmufalyRpp13o0l1dul+7Yo89q0v3demeahn/k36yWiaBa//OKHlBkqSddGOX3t4uPAD0mtxbPX5wl15bPZZq5IHXtAslSdoFj+jS67r00e2KA/DoLj2zS984efxdXXryyWppCr1sv9Cly9oVkiRt08dE6V0jaDs0H9elB3TpQV36nS7dv0svCefoaRh5gTxB3pAkaScQyPxHu/BA1D1pfMZXdOkF1TJpHq6XW9uFkiRtAz0I/9ulp7UrDgC9ay+rHj8uylw2e9c0BnmCvHGI0wQkSXuGIIZJ+Z/SrjgAn9ul66vHDIfSm0ggJy1CniBvPLJdIUnSJn16l/46StAmadbjo+QR8ookSVvB/C6GfJiUL2kWgRp5xG8VS5K25l1d+r92oaQp5BHyiiRJW/FfXfpAu1DSFPIIeUWSpK2g5+CWduGe+YQu3dylf1hTypvrSok8Yk+0JGkrPilKJfTidsWeybvS81lIL+zSN41I39qlN3fpX6rXkvgWqVTjN2e5NsgzkiRtFJOo/yfKt+AOATc5zaDrtP4syusJArWbfjHKtft3UX69ok/eb29dyCOHlFckSXuEHqZ/69IXtCv21LfFScB2ebNuLG4izI12L7UrtDMI2DhPQ/cN5Ddx/zXmn0fWL+NRUeaxkWckLYkW8Ku79PdRWlqvnCwnE89rdZ0G+3lilMx6R7Ouz9d06Ue69KLYvZtzctPQv4gyT+e6Ln1yl14VZQ7QPnhgl747TuYafUuXPqpLV3fph6rncc44B0MFeqLgf83k73nzK1067tInNsv3Gb9gkEEb1/ZpvbVLn9kuPHAP7tLPdOnR7Yod88wu/Xu7sMKvEnCjW/L/33bpc6ZXf6SBsux9BxkK/eMoeWaRvP44nvtgm/XUmOOpPUeh/Ftdem+Xvnfy+Du79NwoLad1ZpRruvTfXXp2lEz4xsnfeUMmZOoPxm5WhFRCV0Q5Psz5uSt28332Ibi8L8p8I3pP+Ax/GCXY+nBM3yPpqigB3VhUzJzn84Rzftyl22Jcgc31fmWUnoYxXhsln9wdJajeJL7Nx765XjQejZZ/jNWGlM8a1+GbopQDNED7EHBm+cxneX617i1R6o3bozRax6JR+/sxrrzctyDkR7v0+iiN4XqO59fXT5qD45JTEW7s0udNr/6IL4xSzvCctzfr9u1YaUnZgr62XRElo1JYrzNgY18EhRQAn9al50W56/UQ3sdxLM7Ym/SQKJmmRgF9HLv1PvtQIMz7Sv3TYzboYJhv2Z+SuTNKELvrOFdck/Qsr4I8wjYWDQ1d7NLLu/R1XXp/LO59oXeDbfKTUImbjm7ym5dU5NnLQSU7pqdVBfmG/LZs/lkHblD7DTH75RCWcb0+IspoCr4sThppdV7gfdNLmHKYPHGD6Pp+at9e/b8IwQX7WlS/LBuEsM02SKae++U4+8ZOBqLtN6XJsxy7IZSXN1WPXxLlc1yqljH6wWgH9WfepLsuQ5Y9VtojnHQuEirXvmFP1hPlL8pQy+ACpLJaxi4GbLynNmDDcezW+2xdiHIO5hUeDG/wDa7EZ7kllv+xZubF3NMu3FE0GGg4rILjRmBL63qMDPAWBWy53XqYnWCbc7JJ9B5n0EaFoXFo+FBO1L1Sm7IoYKPhzAgGuA6zt7fOt5QF9TXKNAq+SJLD21yfGfQti7zyT116WLuisWwQ8sNRRodqzJWjTDprHPO3NcuoR8dME8mbbmdZm3mf8wSGohmSzrr6S6M0BghG07LHSnuEi5gLZKi1TmatAzYyLD/eS6qXUxDQBfwlUS5MMgcpWzT0ptElzP5eGmVuGsuYP0ELrh1GYltc5Oz/MTEbCNFVTE8FFVfu44oo7yPnuzEsxzZ4zzWe/xVRChpaQwwP1tju33Tpa2N+i4xehjx2QwEa+7kpyn5+cHrV3GNJRv3+KO/jSVGOYz1cwfvlNWyvfu9k6KEhNt4rLbKntSsq7LsuQCksHl89rnFsrotyjNt5e1nYnBdcpwRS6w7YqDDb3gJe96Fm2Vmj0skWP4nAf13YNtc40yQSZciXT/4nwOgbAdgX9JDcG8vP8xqLa4h8SCOszYdDKGN/I8rxv6FZB5YfxWzA931RgjbKL84bZTDPo7zta/jPQ14hzyzKA6sGITlfjjJp08gn72gXzvHVMf1Zs4zIBnQOg5I3qBMvxuxUolWPlXYYmY0LgO7wMRguoxLmIiT9Z5SgBjlX4wei3HeJgIyLJ7tvv6hLfzV5zgejZCDG4pnPxrIMenjud0SZT0VgwTboATxunsPrKMR5LnPJCKC42SfbZlyfdRT03xOld6CuYH4zSkFBy4RMckeUFiPbpdDhtazjOWx7Hub0ZAXGFzbagof3xDZo7bEf3lu2TIeOJQUi2+S1t0aZX/hzk3VkVL6tReHznsn/if953TycF9YvM6TFcFxfC/irosxdoZLgc/9uTAeutDTpuVqmAlkVlQmB7sUo+/2lKI2BLNSuixJcZpBLS/aKyfKfnixjqJuKjNdSMD4lSj4h8B6SwxNDjZ/a2ICN6789p7yuXbYJ2Ugh3RiLewzGujpKDye9BXmu6JHKz/iB6v99xHXG+697rteFfEg5QD5kyI98OBbnk+uLQJw80LosTs53X6KxTTlGQML5o8zP8zfGC2O1gC0b9bxP0Kgl6H9slPeR+fsFUfbDcC1lRItGKdtpv0xRIzjNBsQyyCenbWzQUObWJ9nAznxPOU6nB3UGdVlt3rHSAcjKYFGGAZmbVn0d3PE/y7L3hxYTF2hmWirwNkOyv7oXgnU8Jyt7eo64SGs85zjKc8g4fxnT74MCndYHqAj79pkXMq1cAgkCCvC5CKiofNhu3XNBbxXbbnv/amT22+OkEHtVlIKC/dCqrvdzFCdfn190LOuKmtdk5ciyF0/+z/kS2XJc1BOR73Esjvfx5G+NrngC9CwoQZBcB4IcA1renI95OK6sX5QyyF0k98n5vTBZxnVAYM15SRwDKot0T0zP28lercsnjwni7o7h3gOG+XnN2OF+Pte+BWx4RpTAlP0TYK2KsoCUvf2JoTLOIzhGQ99i3AbKhqvahQM4ZqRlkL+GrieOP/kwcW7aSeibQl5+ZZR5cWONzTNtEEIjOq89yku2QcB5fZS6h8d1HZMdEy0a8qRE2TEPZQTboIwZi3KTbS7zmhrlVn0+qdfq95Dlcz1i0h4rHRAuai6AeUNeIAOQKDSpKOoKOIMtCi9k4ZtOE7ARrJE5anXAloENvVDZRU/mzcI9K8L6fbLPvJCpjN8Q/S1BtkurJbdLIMe2M+ga8vAu/XacfN6s9Pv2M+ZY9lXUdO2zjIIp3yMZ+sn1kwbwWvYxD0OcTCJO8wK2V0Tp9fvsKBUtrTyGwlt8hqGA7Sywz/r6Yv9912BdsHEuSCnzRZ67PA5DwdXYyifta8BGw4HeCPZPogG1CnrZyV+3xfSNWQluyKfgWP1JtW5VV8bsHCdw7vqW9+G9jj0H9Lq+O6avKXrwGX0YMhQksB3WkQ8fGSUfMo2jLx9uSjYqxxqbZ+q8yrHgNZT/4NphtIVtcBxYTx1S12nvitnpGeRptkPPZOIWTfN8ZfT3Qg4hkKobhsu4EKVs/6xqWQZsiWuAPMIoSKqPlQ4MPSL0aP1a9BcKoEKhJ4fubiqKugKm0KFQyYBhHQEb6+vKE3XAxr4ozOcFAosCNv7Ou6jZbrvveXhPbSCD/Hx9FW0acyz7Xk/hNKaAm4fXDgVsN8RJQYh5ARvvfVGgwfV0S8w/T1h3Dxs4bvXxWXQ9gPX1ec+ALW0zYKPAb68DXkfP7zbRuKl7J1bFZ6SRA66LugeaXuwsM+rGyYOizENdZtidoOIJzTImcl8z+f9SjLveaFgxzWHI/aIEDwRmWdYyjDjWZXEyTaLF9dOWrftmbJ6p82rOmZtXXz0/pusXsA9eV+Px+6I0Ppg2QZm8Tjkl5DTn5/diekTgOZO/BJ5tWcCxYZQl80B9rHSAaP3Ri0TrpE9e/Ay7tQVEBlsUclhHwEZFxHBIrQ7Y2BeBTRbmoGCk9wmLKmgK/+OYDULAdushUbBtUov3lJ+7xr5o7bIf/u/bz5hjyfttM2e2LnNINI1t2d4ds9us3RrTw5o55NoGXe3x7ZNBzlDv5I/H7Nff+9Iy30LjuB1SwJYNlDoo4TqhMtgWrjfmSz6mXbGC+tgRiNXn7Nfj5DiRt2qf2jxe5HHRnycTeZ1Kf1W5naM4yZ/8P9Q4Xkbfdb1vxuaZzKtZHs3rtcqguK3L2Af1XI1ttoHdOlE/UZcsyt8trpWjyd+Un5eRjbpc4hqzh+0cYsI8F8IXx3Rw8ucx3cK7I6Zb1fxPBgIFx89PEv8/MMo3OWlhkiHJbCxnPzyH9RRcrOM5tCYpSJk3RACZXcEsZz9U2sydAhmT5zx18vi2KJNf2Savz5vBfnyc7JNgJAtq5gbQWkl8U4ptkvg8bJfjwGO23YeMyHZzzhmeEuU2KXkMr46yn4uTx0xcz4Bo6FjyPnm/bJ/3X1dKtNapwNkv++FxVgA8fyggY99vjZLJ62+XPivKue7T9y1RhhHqoYRLMVvIEJS2wxCbQIG1jYAtA+5FlQDDzvTgcEy5hnmvvLc8drT02Td5MtHr+YzJ/zyPeUvkCzwqyvOpqDaBa5rPuW58hmujXNP8zUYk1yx5GX86eR5BPMeEcoS8nPn6V6P0nJDnLkT5kg+V5nuizE+l567OzxxLevVuiel8/O4Ynq+4CJ+B95n5OeV8qz+Icj3NCzzGau/t9aYo+XBfkFfahmufzKsc1xtjdgrIN0e5Huq5akeTv5RDXA9M9Xhsl948Wc6+2yCO7czzU7HczcOzZ5z8Wcug896Y/dYwZXmW4XXK48P1Q71wcfKYnmK2U5e7dbmmA0VGIDDj4nh/lG5iLvK6FwtU8mQKeqJI/J8Vf3uRHTeP+TZnu55Kp16Wld3DoxS0tKwZx39O9ZzEvimsyUR8+4fPcDx5TqZnN49z+1dG+ebp7VE+J8ORic/Ddpnk/M8x/0aQZKInRckwZMC3RHldXfDznthPBoh8ljR0LDNgyFRnQip8AizmbRCY1q2rd0SZgzeEAoNt8p44zxzjG2L21iaJQoWgrUYBwfnhM78vynHks9YIoNnHJnEeKdCeF6XCJTAaCuDplSXIZz3XPYExlTqBAM/hubyGhgeVPsHVvNu8jA3YMoCszy8pC2XWcx6ZM5PyeNO7xLenuX4TwQoV9zK9kKsgX1CxrFvmZ749TgPqvVHOS92oyWNXo7eZY0CjhR4IrsOXRunJynNC2cZxo7eXoC8xB5Qv6jAkWgdonOu2ol0G75P3faFdEeVcM9eMz9H2BC3rRVGuC8oH8uETYzYf7rJlAzYQpBA8ZT6kPPujKA18nkcj8fPj5Nv9BGwE5FwfBLQZ/FP3cJ1lsMN23jb5vw8jP5w7yoMxcoSlbigm1pFn257FvnKh3QZlHGU8n/XDUQLYWn2sJJ1D2duxDALVo3bhActgog6gN4VKqS24143ggyCkbs1vWl/ARqVPwEalT6OQ55AI1llW94qwvJ1Yfilm70vIcxYFEasgcCT4fki74pwhuOB89gU1tTYI4RokwKax1QaoXAvtNUpDrA7IU/Z2923nrJFfybfr1h4rSecMw7fcq2kZ9BrmsN15kJOMt1FgXhfTXxY5C/Qit0N8m5YBG5XyT0yWZcD2sJjtCW4DtraHDbzmM6JMB0mr9rAtwpAeeaOdi3rekFdyuHLINvLUWaMHuB6NWZdDPFaSlkDrk2Ew5hMtQuuWoda2lXseUFgex/Ck9rNwsV2wZpzPVW4XkXPFVsV1eE2XXhZlOOn6KPPUGNZnSIthVYItei94vwypMqR082Q96vfB9phzyhB4fW0zVMYQ2lna9DWya5iOwPD3mABjzHP2CY2Ls+rRO7RjJekUGD5grtuiiozJtj/bLjwnCAboAVo0xLNPqFiYt3ZaBGtHMTvBehVDwQ5zEOfNMwTvo349n69+Po+XufWGTid7S8f0MhqELMbxzDlvkqQFGOpqb9q5z/gWHRObT9MbwM/48K3NXaxEbor+4Sg+54+1C3UmyCtMvD+UvCJJ2iMMdRCctLcL2Fd82YRvrPJtykWJSfQMSTLPLYciM23j9i5D+Jbtc9uFUYZZ+5Zr/bheuDbIM5IkbRyVELcR2GcfG+U+cEzYX0c6lABW60Me2bWeV0nSOUIlxLdFJc1HHjFgkyRtDbcpsCKShpFHyCuSJG1F/fM4kmbx5Q7yyDpu9SJJ0qnkDXTXeRsL6ZDwzdAxN8yVJOlMHU2SpFlHkyRJ0lZxs1juMdX+RuW+4meant4unOPaKL824M1O1Yc8Qd5YdANuSZI2gkqJ3ws8b/gJKH5JwIBNfcgT97ULJUnalquiVEyn+ZWAXcJvbN4ey30OAzb14Rq6t0tPaFdIkrRNl3XpdbG/wz/8Lic3vX1nu2IBAza1yAPkBfKEJEk750Ox/z0K/Ej3MgzY1CIPkBckSdpJF7p0Vyw3pLhLuE0Jv/vI74WOZcCmGtf+nV16aLtCkqRdcnmXrm4X7on7R7kZMN98HePmLt0TZf4efyWuffKAJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSpEH/D4sWjWXZm4ynAAAAAElFTkSuQmCC>

[image22]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAaCAYAAAD8K6+QAAACTklEQVR4Xu2WT4hOURiHX6FGyN9IjZSd0iiKFBZSWLCQslB2QhkLsyBbLG0mZaPMyp9mNrKxkMbKFEX2CinZCgsKv6dzz5z3O9/NPd9kcU33qad7z7nn3O+857zn3M+so6Ojo6NjfrBaLs4rM1ZYc5tWMSw/ye/yiKu/IN/ITfKs/C1vyUWuTWtZIictBPdRPpAL5Sr5Qr6V6+UNC4FNy2V0bDuH5T55U/6Sh6r6MxYCuViV4ZIcd+Wcy/KUXJA/KGTCwkRHSPtROeLKO9PjMt5ZWCFWCu7In3JPbCCuy5OufMDdA6v7RC7N6ktg0Huzum3yszzq6u5Zb/CNsDp+NXwaAunHSzfPtujdj7BSDmV1pey2shR/ZCmriiCwY678RU5ZOih2yLuWBs4JmQeWQ0qusbIBkw0lNG2HPgjsfHVPWlB+bGnZ71vvADdYf2BXLB0uGy3NLMGRAcAEfbPwW08tHFpr5fPqeWTMQhB5atP/paVMauS2/CEfymfyhPwqX1k6NT11gTGQaQuBcfhst9AOeQcwMPaN37s8f+3KZAXZM2NpsiP0py19imFAdGCGgZVjZtbNtkg0BcY9mz8GFgfCwD5U10geWOS93JrVzSmwQYiBEcS16uoD4/TcEhs76gKrS0Vgjy+3dNzDwKk4KAyGdOOHr1rYBz4wUpd/K5Fd1bUuMPqylzy8n8k5KI+7eiYz33f/HALwB0odfAKwibrjnm9q/rFnFWn738Dpm3+g6xj4A90GJuzvg57TX6o2sF+etv70A+rO5ZUd84U/yEZdEEa8vJEAAAAASUVORK5CYII=>

[image23]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAaCAYAAACq/ULmAAAC1ElEQVR4Xu2XP4wNURTGP0FC2PgXNhLhRacQhUIiolJQbLEiIZFoFBQoFP71CoVGJBQ2G4W/qxEKEpFBI7aQaFSSJUKlERQIvi9njjfvvp23c/ft5g3v/pIvee/OzJ1773fPuWeARCKRSCQSdWU+1aDmBO1TsZTaSq0NLyRmhrnUCyqjFrde6shtaoIaoe5Tu1quJrpiB/WB+kX9Rpw5C6lxamX+XxH3mdry947EjBFjjowYhZlbJKM+URuC9lKWw/JpJ5Zg6nv+d2LMWQaLms1B+1VYP0NB+6SsoT5S39D6wDHqFbWOOgzr8BI1r3BPvxFjzmrqLcrNORm0t6GcOAYz6D11C3bwuetvqEHqPOIG1iuUy/dEaKM9VpmYNVDaUvqatjmqHLZTF2EH3s68/RCsg+P5f6HOLlCLqHcd9IxaRZ2iDiC+7HQa1L6wscfEmLMJdvhP2xxnAhYpihihg+wHtc1vIGep/dQArGZ39DKFr2hQD2G7RlH3CGZmDAuo09RPWN91IsacrtOao5sVFU4xpQkN5ga1HvbS4rlTNEcchQ1IH15a6FgUaTI0w79tTllBcA3Wz+6gvZTwZoXjHTRN0AuuwxZb51OR0Jy9aC8fHU1qBaqlugzx5lyGzaWqFKExxJijtdMahh+dGfUV7aaVopceyX+rXNb/B7CCQdxE+YBCc5wzaE5EA9W5JlOkc3mbh76uPYflaSdDvDmziQolrctLWAUb4uugOTnaiE9hnyHOd9gGrswV2EN3qSewh7/ABuLVXBll5iinZjBzdAYdhA1cUqGglOnm6CwLyVAPc7TDtdPDqJOKKPOMormhndfUY9gcdW6fgBkdhRZRiyW3hSJIC6jKqxNVzNEEZYibI2mAbs5kH2QZ6mFOt2gdVRHLnOHg2qxTxRwVEirPQ/rBnJ5SxRydL/fQDHnlYP1O5tQIVXtKk9E5N5FIJBKJRKLv+ANeILMufxAIXgAAAABJRU5ErkJggg==>

[image24]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAaCAYAAACq/ULmAAADeUlEQVR4Xu2ZW4hOURiGX6EIOUYONZNIyqkkjaRJiAs3DlFOFy64GC4op1tJlEJCDsmN843cUC4GJeVCRMqhkCjFhZDI4X379pp/zfLvPev/x/yjsZ56a++1D//e37vW9317BkgkEolEIvEv0o1qoIZT3YNjbTGAmkmNDQ8k2k89dZs6Rt2inlJT/BMKuEA9oU5SzdQqmNGJv8BQ6iF1KdvXqtlNPW85I5+e1Ha0XmkfqJXefqJK+sJm+3tqvDeu1PaSGuKNlWMhNSEY2wq7p+4dxSCYy0X0R9vndDVGU29hRsgQhzNtqjdWjgXUY2qSN3aV2o/I1DYK9gBfYE47NlIPqDpqPfWLOkL18M7p6ij4n5Fvjh+vciglKm7SQdgiuIPW98qlN3URZtBr6jwsPw6k7sLy6jBqH+wHmlHBcuwEplNLKtBEuyyXOdRPVG+OeIWSQbqXOrcotOxmUYdgF87PxtfBbrYp2xfKlXK/D+wH86RuRjNmG7Uakcs3QJNGndFealxwrJYoPopDteboPW5SI6jZ1DPY/fRu0SXiBWylaMWIU9R3WG/u2EWtoPpRM7zx07CHF/XUNVjx1Kq7DjOzEvTiajtl8E7qK9oOQkfR3rS2GRYTh2Ihc35Qjd54IS4nOvyUJvQwZ2EFUg/p1x3fHLEB9lJavr288ViUSt5l22pClKObW47WlryGQBNUGWKaNxaiTu5ROEi2wOKtTBSFTl7k7X+E9fXOBAX7DCzYqk8+oTnLYAEuh0wejOJU1whbtY7w/kUcRSm/x0jfIEW42qt4TPbGXSs90hsLceeEuPpekTlN2bZyofbV8ilninPIbwTygrcDpQZCJquuyRRpTzbmXkDHtEL8AIi5sLSyOBivJWOoN7BUL/T8MlXP5ePi4K8wfWxqsvqT8QTsrwbRNUcXfKMuUzdgN/xE3UOpm8sjzxz/Y0s1aC3swSU1CkqZzhzVspA66j7+fLnOQMVcqXY5dRz22bG01RmWeWSgm9BCna9qplKgPk0OwCa60nVFKIgKltKOkLMKoApzETHmKC3KEGeOpAd35pQrrJpdeemxM1AxX0PNy7ZjkRG6RhNQ7XtNJ1qMOSqsas9D8szRxGjItvUy6toSVRBjjurLFZSWvGaTtsuZI2MOo/ShqNqlZiTRwajbU5qs9P8hiUQikUgkEv8fvwEiVMELmVoOGAAAAABJRU5ErkJggg==>

[image25]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAaCAYAAACq/ULmAAADRUlEQVR4Xu2ZTahNURiGvxuKkN9IlJNMJFFCJANJDEj+RQwkBhig/IwYSAZSUoQSAz8xkQlRjpSUgZJMUEiUugZCovC+ffs75zvL2fvsfc51z3VbT72199prd9de7/p+7r0ikUgkEolEeiId0GxoDNQneFaEzeFApDVK0EPoDPQAegFN8xNyUoIuhIOR5hkFPYOuJ/eMmiPQq8qMfPSDzks0p8sYBJWhTmiSG2dqewONdGNZjIfuQnukCXOGizqbxRBpPKe3MQH6IGoEDTHMtOluLA3u2WloA7RECpozTnQB30RfNnZCT0Vd3wb9hk5Bfd2c3g43/6ukm+P3K40V0EVRkwqZMwC6JmrQO+iqaE4dBj0WzaujoWOi5pRFF9ZTmQWtLKAp+loqC6Bf0po596DJyXUhcxZD86CTootYlIxvFTVjV3JP9kInoIHQ2wyxm2ER3QdtFG1Bi8JDw87oEDQxeNadcH+4D82as1T0W4xC5hivRSOFEUPYVfyE5toEcBhaDw2G5rhx/jAunpSg26LFk1HHIkgzi8DwPy4aweug76If2Q5aSWs8oHeCsabM4elgVBg+pREu5rJogeQifd3x5pAdoh81FOrvxvNinRDftevCH9RFpDUEPKDMEDPcWAiN+CG1WeWTG7siOQ8uzVnu7j+L9vVmAjf7kuiGsT55QnPWiObqetDkEZKd6hg5W5JrRmAndLDyNBt2RfyWvNqvr6VitZf7MdWN26EZ68ZC7HB5Mc2zxvO60T5U4EK3J9fcHN7fkmq+pMtpjUBojnFAqg0ETWZd42Koo8mYfSSfPZLaDXgOvYRmurF2wJr3XjTVE66fpjLdeWwffIR5uK/sem9KzogxzomG2w3ovujp/wI9kWo3l0aaOWwgyqLmMAL4NyV/gpgyzRzWsnpwY5gCdocPupn50EdoLXRW9NeOVTUzNPPQQN8AGNyjMGrLkn7g/4ITLdwIneYGsrBlkcccpkUa4kOcBd/MSSusVnjZ5rcbnvZN0MLk+r8gjzksrGzPQ+qZs1q0rSdmDnN+pAnymMP6wlxrIc8/BfG6njk0kSmWWEEuV55G/hnsYJgmG/0/pANaJlqrGs2NRCKRSCQS6Z38AdRivZTafx1iAAAAAElFTkSuQmCC>

[image26]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAaCAYAAAC6nQw6AAAA90lEQVR4Xu2UIQ9BYRSGXxubYGOKICgKQVKYqJhNoNj8AEkVzaaIgmS64geYIGh+gEmCJCEJCt6zE9z7mbkfQfFsTznnfueec+63C/yxIU339EQ7NOBO2xGmS3qjdSNnTQNaaGombPHTCbTY11SghUJmwpYY3dCcmbDFR4e0a8StydIdvdKiI56hLXi8GnnofapB9ySdSYfCmM7hYXfy9iNtQw9foLuSnXmmTM90hEfrM2hX8hU9UaULGjXiKXqAjjqgW1pyPeEgQlc0YSbgvpx9usabMaXYK2RMOSw6F/8xMmaBJvG8AiuaNE570L/EVwTNwJ8fcAd+ACZAfQloSAAAAABJRU5ErkJggg==>

[image27]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAaCAYAAABPY4eKAAABg0lEQVR4Xu2VvytFYRjHv2IgiiISBrIxKJNRUaQMJsUfYDBZrLdkp/wTRiUkw8liMBlEmSyEwWzi++05b/fcxz3O/dE9Gc6nPsN9n/e87/O8vy5Q8A9ZoQO+MS++6RFt84FWMwSb/JNOu1ga3bFNs03fYQkcoLbqS3TZN9bLFj2mU/QDlsBeRY/fTNBX2uMD9TBIb+kirFpVrclfkp2qoIrVryk26Qntin9rv7XvaQO/wWJJIzSwAv30GlZ1QNXrxGvQ8UR7QAdzkt7Azsgw7avoUQO9sImXfADlBJ7omIuJVVhy+659FDZuJuv0DOXl9szCJtj1AdikiimJJDuwBDK5pGu+MUEHbIIH2FIHdK+vYCddJ74hNHnWIfmCJaA3IBCuWAT7XnuuItoTff5E++xPbJZ6C0S4YmE7LughLIkobktFe6wP/OBZ3sFuhw7UOX2kp3SGztM5+owc0BLrcVIygRKsqNzR3/A93aAjLtZyFmBLrsen2sPUcjqRfXsKCvLjB2O9WYpC2IpCAAAAAElFTkSuQmCC>

[image28]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG8AAAAaCAYAAAC5KgISAAADPklEQVR4Xu2YT+gNURTHjxCiEJEokY2V/I8s7FBIUpSILFhYIcpCYmWlpFiQ2EjsKJLFiwVlIUVWCoUsbISSwvl07unNu+b9mvd78/u9meZ+6tubuffNzL3n3HvOmRFJJBKJRCKRqBnzVWtVY+KOBrFeNTNurDpTVc9Ub1Wzo74m8Vd1JG6sOrvFBn4i7mgQ01XvVHOj9spzRfVbtS7uaBBLVHdU4+KOqnJAbMfFagozVC/l//m/V83J/K+STBEb5E/VXdW8cN4Uxqpmic35tmpLOMaptSjcGGQdQyZGLiIKsPHhmm4sV/2QGoVMp66J+kNBvRbLZ0PhBdsgmKw6Fn57pnaJegTwgm0QsHnOi6WwnmHVZV8ReFEvg7rkDYz3XCz6AEbEJhPC+USxvEh+LAJzZu5FnbFT9VCK/78DVh0xn7xwWXVU7KX9sepaaOcBf8QSOjyRTodzTH5h93K/i2KTOKe6Gdqp4GhfKvZBAA6r3ojlpZWqk1LcSGVB5Pmmuq5aJTY3Cjd4oJoUjveJ2YVz2i+E9uOqzeGYEL0xHOPAXeGY+zF/bAM8CwG2a8kwnbdCdV/1QmwgGG+r6pe0ixgcw8PdeS3Jd95i1VexVxDO90r7qw3Xs6KzLFR9Ensez17T2T0qsDgvqT6KLapFoZ3PZCw+L3w2SDt3+qLDkWfFnAqfVcukfY07y+23PZzjuEdiea4v5wE3z17MDam+2JFQ1HleteE0n4CHnOz1DjuSnYkwgq/y0cZDXXbXM3bG5PNAXrUuECuGWGz7QxuwAHCw/39aaI/th/NaYjbv23kx7ITvYqEM4oe3JN957CRW38FMn5PnPCDMfFHtiDsGDLnQQ2MMziYFnBGLNg5RJ3vuxPbr5rw8+/QMu+WV2MpjoKvFdpTfnC3vzvOJMEB2EiGIF34gnJwS21HdnOcfxav4qsLXF2wB7DrCv8OiIyxmq3Ry3qHM+Z7wO5TzWOhcR5jeFvpLwcNJ/HBgMkyMXyqymF4qtGzoqRrZecZ0mx/h0kNmEbhPHLZLI895/XJLrCBg0Kc7uxJlck/sC8RT1aaob7jcUF0VC7NUvIkRgvDplPUlxnNIXshNJBKJCvIPgGueVbJI9n4AAAAASUVORK5CYII=>

[image29]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAaCAYAAACO5M0mAAAA0UlEQVR4XmNgGFSAD4h9gTgAiJXR5OBAHoiPAfFSIH4IxP+B2B5FBRQUAXEClM0NxHOAWB8uiwRACpcDMQu6BDrgB+ITQHyLAeIMvCCHAeK2PQwQjVhBJBA/AuJ/DBDFxajSECDEADFFhgFh6lUUFUCQwQAxBQZ4gPgAEH9FEoN74DmSGCMDJCxRFGoC8Vsg3ookBgpDkDNQrDZmgOgEBS4MSAPxAyCegiQGtmYCEN+F8kFOOQQVA8mhAFh0gdwF0tAJxKwoKtCAJAPEx6OARgAA7Skk/hcelgYAAAAASUVORK5CYII=>

[image30]: <data:image/png;base64,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jFrMMc3JVj/1Hms3xuz+lPW5eSD8+Fq4dljM+Ail9R+askV0sVURX0Xj6j3G5sFuCHw17VptERER2RqujWKpGgIhVlu8mAK9ufcHhBRfNdcsWhc2j1UsbFyb26aswstjPL4iIiIixxLEF5tRs8C+hTVeb4/yYRAL+7GAsW0J1qmHRrFqDVm/9ssqgg2huJ8vXBFre62niIiIyHGHX1HA0jYkvhA4TD3y92PN8a3VdetgFcHGl7PsZ5fb8/BrAYs+IkBo3t65+7cnRERERLYBfmFh6NcUWNzPxuop5trjdbKKYEvYJ63+abIxuG4Sm9siRURERGTj8KsfLMY/Sjb5Swd8TcoWJiIiIiJbDdYnfv4rfzrspHBS4yUiIiI7ym1xvH5j96Ag0hBrToWKiIjIiYLfAV12P7Xjzk1RvnIVERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERWS//DzBxXGz5u5sgAAAAAElFTkSuQmCC>

[image31]: <data:image/png;base64,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>

[image32]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALUAAAAaCAYAAADxGR2SAAAGHklEQVR4Xu2aa6htUxTHx80j4no/Qx5J4eYZt1sUIXwgiSiU8oFQypt8OCUfSJFHt6RukoQbHySSskJRlC+klNwrkoRSRArjZ6y/M/c4a2977cdx97rrV6O991zrzDXGnGOOOeZYx6ynp6enp6enZ5tgjcu+9ef2xC4uB9ef2xu7u+yUG7vCcS4fuHzi8pLLnoOXO8udLl+7vOryXbrWZfZwedzlC5cvXU4avLz4nOvyrcu1LkdaTPJd5Q0dZTeXd1wOqn8vuRz279Xugr3Y/azFGDzvUllE7U5wsstPLpsstiEMq2rpjJEN7Oiy0WV90XaRy8XF767ypkWEPqL+TQD7xeVU3bDo/GWxUplk2M/lU5efXU7UTR2D1IpU6/fUfr3L06mta2gn5lM8ZuEHtxZtCwuTizFldDrW5QcLww8t2rvElRZ2V6mdyb03tXWNJYtduSwGvGYxHpcWbQvLGS5bXA4p2i60MJBoTdTuGuxImy1sLM8N5JZvWUTrrrK3y4e2MsUiFfnT4my18Dzg8r3Fyn2qlo8sJpyJV0rSJY6yOBRjI7ml7H7OIh1hoXcVbPvD5RVbthvBoRkTxmahoS671VauTlKPpkMDkYxS3zOpfV5waL3bZl8zJzrj0Gy5ZV1aeeWsn7ctwdxhYwljkHetaTnB5Un7H9JXDoEcBvODMfANl11Tu1gtpz7QYltkMc0SDoLYWObOOhwTsebBAS535MYJmKYfpVfZqTlDUf1al9rbcLsNzhMHTp5DKgvT6N0KIjEReW3RhiMzsRcUbZnVcmrYKzfMAEWr8lCEvdjNYp4HbOsP5sYJmKYflWp/Te03uzxh0+1Qj9hg+Zdddh9b7nMavVuhKkeZN29wedFGvzbNTs32xUrcIbW3gQEhMo967qwgzSCvVO6M/ZQ0yafP1E01TEr+twG1tanh32Mrxw3U1zhw77B+xoF5IuUidxYqbR5dtEFb+zibjLp/Gr1bwSA9auFMfOd18Y8Dd0Q7b570yhynk3L6e004/Xxcfyel2WrLNV/+hgPp8S6n1ddUA+fVtOqjOFq5DZIiaLDUpxyfPpsGStUbBGfNoAO6EKHgc4vDUrmgmOQtFtH8MotFcJbF35b60YfSNHRlGwd2wa/qT8i68taSdEc7IhUJyoyAHnKSG12uq9sh95OR7eV7h5LzXH6rv59uMd/Mu5BegGNLL8aBMbi8vsY88KJKVDbo1MwVJWHd06Q3tjP3jCf340vDUt5W7O/yvsu7Fiv2mMHL/zhqPkBIOVURBM5NBYHB1CFUWzx/U1kYnid8Z4sozyDi6OVg8WwNlvoU9EmOmOG+9yzSibfTNXG1xYCyK5Hr5R2CRcaz6KuEalGZrrFAFfHRlXEEbOO8opwyTyplQ8buFItncABXAADmgjaeVzpn7icj27G7KXLSF4vvZQunu8IGdyHpRT+lXswJ9+v8xdiUL2oqG3ye5mqUU6u8yLihBzIzSB3yFiuYnGFOrZy8hGsY12RUVV/LTn2bRVS8z+L+Nk5dFb8zLLqmSC2kZxP0zbPyddknsEH6omtVtDM2wyaVe7+xWMRyoPL8cI5F7pvPNrmfYWB3k1OLYame9JJO0gs7yvHge+kXlbV3aliyWMB8otOqwEuZYU6tnFwQBTbXn01GVdbs1EQA5XQ4IiuWkhBM49Q4xMO5cUx4bhmZBPk4EUYQpctIXdXfRzn1DS5XWYwdY9gEhyqi5Gcuhxft6oc+NH5NTGq39MqM69QKSk3zX9ov1lnsmLcUbXNnjUWhXqua3FrK4bwb63uAfIx/W4Umoyprdmq27LX197MtjL6//j2pU5ObEa025AtjQu7MYJOmwPkWuTX//MVEiFK/UU7NYuCQxmHtJovFQu6qCV7vck39nVSM3JUx32SRIgn1Qx86k2SwfVK7pZeQXv/l1PwNZdFLLFKuPP/ZfoEPMU+jFujcYOKUoqBYCb+nqX7QJ32P2i7bQH845SwOHfSV9ZpUX5y0LHOJtmVL+sl9CNk+LejURi+diUb5wDD7CRg9PQsP6dULFjv00uClnp7FhKLA6y4PWaQsPT0LD2kKKWvbFK6np6enZ6H5G+uISbvsmMoXAAAAAElFTkSuQmCC>

[image33]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAbCAYAAABBTc6+AAAAg0lEQVR4XmNgGAUkA0YgNgfiFUD8DIhfA7E2soJVQPwDiBuBWBWIhRkgmsCAH4j/AnEwTAAdlAPxeiBmRZcAAR4gPgDE/9EwyBowkATih0CsBBNAB5xAvAOITdElkIErEM9iQHUDyMso4DoQ3wHiuUB8GoitUaUhfgb5HeQmATS5EQ8ACy4TcCzBFrcAAAAASUVORK5CYII=>

[image34]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD0AAAAaCAYAAAAEy1RnAAACd0lEQVR4Xu2YTYjNURiHX6GIQuSjlI9QipBSihQWSrMgGyklCxaSbEjSLFhgJ1ESWcjGzoKFxWRjfGyIWFBYkIWNslL4PfOeY859NWPu3HulM/epp7n/c87/3vOe9z3n/u+YdenSpWY2yxvySvBSOag2lstd8pj8KS+k6y3loFrZKT/JxbGjVmbIJ+bZHjOskl/lhthRM3vM9/Oc2FEr4+R186AnhL5qWSu/ye+xQzySh5N35fbG7o4wUR6Xe80T0hEOmGf5ZWifbb4gmbmyp7juFGyxt/K+nJLa2H4rf49oEcr5tnnQN0PfVjkvtP2LoGG6nFRc861SJqAlZplnmKDJeAkn+W5rLLGNxWugGsrJjYSZ1lzZLpRPrY1BnzMP+IV5+UYemPdnp6V2JkAJwlL5Rq6Xh8wXkcWE83K8eUVdlRfNAz4rb6X296l9jez32+yE7JNTzT/rQ/qbmSzvmd8HR8wfp4eF0v1hjQHhunJQgkzSfk32pjYeVR+bl/8S+VAelSvkZ7ktjWMhgEfdL3K/+T0cUiwa+5eg2bMllHOfDR00cM8780Qwn5yQllgdrjlV8+HCDxQCJYAsEyRzZBApYzIC+RuCYPN4tgZVQNDxrBhJ0ItSOwu7L/SNmjgRyEGfsT9P+wxZJpCDRRvP8zzXx3MDmgm6PFjZJpT3afMFaAtMZEFxTRZ702v2H0FkdtjgrzJK9pV8Ntg9cO9leSddU4qnzCvhb0GzNT6ab8n5xRggy5wVzRyMw5LLjw9iUssauweghJlYhHNgqFM9v2+zxK8xYNHaspf/d1j813KTjaEfSGy55/KkVf7fnQhbarTbpEvV/AK6wm5Nz6aasgAAAABJRU5ErkJggg==>

[image35]: <data:image/png;base64,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pHjy+BwGNr7HDJ7v0RZYgjpyfC57rCjHeZL4TN7RUa7P/XJ9lj3Y18MSPfWwmbDcw6DMsh0On3tcbvlnEVwSpX/QF98aZakTux0bRTxeEcX21Nc1489tvwSWf4jQ0f8ShAd7qbYCPCfPQNSP9kGbOSWKgGKv1qJJX0Wby/1m9A18IX0D+0P2IwQX/ShhXxz25p7xkzwD5JIbfYvJzC+iLOHR1vGT/Bbij8gbv8HxxVHug7rkHur+DNiIe6V90s/oK3ynZVcSG8fF6pbt4UvRL2iHsCvZUGTV4IDOjvIGZDpIWRwMNKt1WrJrgaBDeCOmEegynO3Uj4iU54sMMh/YLO0nstvDHhxmjPUSjSyGY6IM0GxoX5oukt0Q3nZlqY7IOtEdGUbdj0REREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREdkn+B9pBUT0AaMF5AAAAAElFTkSuQmCC>

[image36]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAaCAYAAACq/ULmAAADw0lEQVR4Xu2ZS6hNURjHP3lE3o9IUZcYyDsjMpGIZEBEMWdgRHHJ4EpGiGQkE2OElCSDG0ohMZDyKOQRBlIo5PH9Wvu7Z93v7nP23qd7u/eyfvXv7P2tvc8+e/3X+tbjiCQSicR/wzjVGtUEX1CBoarJqomqgVF8pDtPVGSH6o/qpGqAKytilGq3hPu/qD5knxiyRHVVNbbj6kRlHkuo3E+qOa6sHpi4SfU50+iojN5zVsL3nY7iiSZ4IKHFY9BxV1aPIxKuPy8hLXreSijf4gsS5dmuGqyarfoooUKLUttW1XNVi4vH7FHdlZTSmob0QwUChtBrMGdGxxVdmap6KsHURmDOCR9MlIcecCk6Z7xhnGiLYp42CQZOcnHPatVcH0yUY7zqhmpFFKP3MGN7rZoWxQ2m2o+kXOpLNAkzK4xZ5QskVDqVT+oihcWszcq+uXh/ZIpqng92E8dUv1TtLl6KzaorqmG+IOOrBBMYN2LMHMqL2OADvYyfNZJ2d7pYd7JPmjTnmmq9D0awNsEE1j/x2LJU9VOKzeGevLTYm/iGxiK5J3cueF67D5YBc0b4YMRi1XcJBrF7YFDpGPY7inlIi3t9MIMyxrpGz86DSmR7qAiuYwY6xsVbVPdcLA/u8/cWwbtQLyxHYpoyh3GGSq+iGMar66oD0jktctwqYfaXtyhlIhHvPlyW2v1npLbDgHl3VINUiySsp7hvpuqZhIYDvPwC1dFMXM+1VBTH56Q2aeF7XmXHBnt+1psw9H5URh3ZORmGbLFRwt7hSwnpHd5LLTWSVZhIGZXNoTLY6/KVXyQqLGZ4Fv+huqg6JeGH7pKuLci4KaFCDHYkeCHAnBjy9XQJ6ySMwhjWXrelVhm8vF/g8mzbgD0otR6aZw5lZg7jUVyxTBbsHCM4Jmbm2G8YIqG3Uj/zVW+yOFQ2pzuhpa+U8GJMMOqZYrRL53TGuGUt0JtDnAoljiEYQ8Ug+w5e3qfHWxIaH638sJQ3h08q3TATgN/CsT2fY7uPxvhCtT+7rs+YUxW/lcNit6jnHJKQDvP+yvDm0HrpLZbKuHehhBRr5liPgticbap32THwbDtvZA49ynZT7B6bnvcrc55I5zEnnpRgjo0/8ZhD5fLCtlBep1qeHXtzZkltBkovviDhrwyMoYyNWFJTW3ZNbA7xh9kx8D123sicOFUvkzA2mfn9yhygVefN1jCnXhlQlhf3MN74P/tiimZ8VWdrjX7zP4NPa4k+AC2ZNRGpix3xKq020cOQFiwF8WmDeSKRSJTgL4HZyt+RTGD3AAAAAElFTkSuQmCC>

[image37]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAaCAYAAAD8K6+QAAACfklEQVR4Xu2WTahNURTHl3xEkW9SJuQjJQamysArJDJQBgxemZigSPIxeJJCKSm9QslAwoCJDJ16kxcDIzGgEMlUGUn8f6293X3Xu0/q3Kt3Xvdfv+45a5972muv/177mPXVV1//UzvEHfFGfBSPxY3EObFGTPnzdIO0TuwVd8UHMZju4Zn4JR6Kuen5xumauBVi08Vt8+SGxbT24YmvleKL2BjiWJBKktgLMb99eOJrt/nk48RXiE9p7HgYa4QumE8+igaSbYgtG6XZojJPYJlYLfaII+K12GkN7YrZhuyhUgfEA6tfqevmx8lLcS+M9VTZhrEjbjJv/1Sxjp6LxeKKOBPGspaIEzFYR6UN97cP2YB1J7EnYmYMBtGVL8VgHeU2/83Gtnoq+U4sDXGsSYzJzijiLFJ8FmHDUvyPCk1N9+zfUzb2uVq6aa0vi3JVuWalK/MJzxL3xVbz5oLmiItirfgqjqU4x8P6dI0q83egk+bvQoNiNF2TVExsu/l7eddycdVa/x1XVIcqkVRJ+WWxWXwXh833H3tgnngrTpt/ipEconJUYKH4LHalOKrME1skXplbG7aZWx11SowzlYbGYuxLdE1MkG9GGkm2DpX8ab4QnHNYk8P7vThr4ydGMnnPZrJ1OyWGhsyrym8nm3dNVIw9QZJbzJM5aG6/VekZ9iyruyHdV+aJ5Qp0UpkYi5iFDbHj0SLWE5WrzGQfmX88j1jLlj/EIXE+3VfW2mNUlsaBqDSWRrwjd8+yibE1OPvKZHsiKkXF2Etls8mxnMDfREIkFw9+7heEGGIvThpxptGFccFQ+1CzRRN6Ki6bf7dOGmF57Pov1u6rsfoNmMJ0kJUMrlMAAAAASUVORK5CYII=>

[image38]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE8AAAAaCAYAAAD2dwHCAAACtklEQVR4Xu2XTahNURTHl1CEfDyRMpCBMpAkKTEzYKCkRJGJASMDFCZSMpCkXqQkMpCUMpDI6EYxIDIwNCAxQikmEv9fe+/uOst9r3t83Edv/+rfOWutc87ee52919nHrFKpVMYXE6TD0oWgyFVrxvc1w+MTkrdGeiV9lx5K2xtXJC5Zij+TdktLm+HxDTOL5FyJgcxO6ZY0PQYqZvstJe+BNCPEmJ1H8rHSg02WksfyXRBi66Sh4Ks4VklfpE/ScuefKd1zdqUHJIzEfZXWOv8B6ZyzKz2gzlHvWLqHpMnSdWmvv+g/YqEN8KVPkW5bSt6wtCXbY/V1nSYdjM5R2CEtc/ZGS2MZGGxTynblkbS6GR4os6Uz0TkKrJaVzp5oA/7I0QGSd186bu23JsxSOtz2vl5ss94fqnnSrOBbJD2xZvJGIt77xyhT/VsMBEjyR+l0Fkv+oqWkoZPSNUuD+WApEcBGG3tFtt9Y2iIVOtYtE7SB7aGt+dIk6YZ0Nvtp53U+FkoNBxL+VNqQbY7Y+ClPfCS35hjbNN+nvqHxz9LlGAgwsMfO5lftvaWG0S7ppf08KIo4CTuRbfaUbZLHUuRF0QYro5P9sR3gOZ18Tj2kXdqH0g/8tO9jPJsfhtZMtfQm5sZAIA6sJL0kD/FW46DKgMovYNvkLZHuWpolp6z/5PEsv/nniI2f9mMM/18jDmyx9M7ZhTioX5l5xNGQ9Ny69ZRnEJ9jzXaYkeCTt8dS/+gnlP6WmTemyaMGnbc0c4G/kqOWBkONK7Um1jyWdkke93asmzwG/ELabKkWl9IA7EFvWrqeNoi9ldZLx/I1Pnm8NBJf+sHqwsY/8OSNBPWI5UptAj8jiBW/x98T95T44j3++ZF+vqT9XPNPEJdtpQV3LG192HCz9Cot8Jtl6mKlUvltfgBDmZTeslO9kgAAAABJRU5ErkJggg==>

[image39]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAAAaCAYAAAA67jspAAADcUlEQVR4Xu2XTahNURTHl1C+8h35KJekRCEkYqAoFAOlyEQZmDBTykhJGciAkpBHEgNGEkW5SoixyEddEiGUUMjH+tlnvbfPeve+d8671+up/at/75y1z93/c/Zee+39RBKJRCKRSCQSiURfZrSqnw/2IiN9oJcYJP/Am4G8ohriGzLGqH6qVvqGFjFQddQHI6ap3qlm+YYmwfeYNPbG94UE75YyX7XIByMmq36rdvmGFrFeVfHBiHkS/Nf6hibB96E09sb3owTvljFVdcvF5qqWudhN1VLVRNVFVU11R1XNRCacVw39+3RxFquuudhq1QwXuy8h46Ci2qfarLqk2i/ly535johi+N6WvDeeeC9XvZQw+N9Vj1WPVMclJGRh1qlOutgJ1QoXq6omZdcDJLzEqPZWkS2qtui+KKyaeOUwYddVM6MYMLDDVONUN6I45e5edF+URr7vJe+9UII3MLAMOpMN/VUHJKySwuyWvDEfVVWNj2LApFgWjVUditqAsrTDxbqD/s5KvlRMUD1XDY5iYO+4XXUhblAOu/siNPK9KnnvPdLhzQr/IvlkpK1UyTktYdANBvpZdA8su1XRPcbUPyDb10gY8E3tTxTDJtf6gjkS6mZMRTU7u+Z9fUZvcPdFqEp9341RrKK6Kx3eDC4ZbiWEbz+nepPdF2KbhBmiBlObOI08UX2OYvEAYEKGvZJgzvP00Qhbqt8k1E0PKwV/64sM4vpDFKNeGkw+2clvEH3HddhgAD9JeIZB85gv34mP+RLD23ynZM9TTmuq1xImi77pY3jWXhhelpfG6K2EjcNOJeiphDpmUE4eZNeUhCMSsrsrmJBfUv+UwQfxYXhRC9mwkfmziVXs4YglqssSnuGdPawesg9fv2Ih9kXmS5LV8/XlZKuECeLQURqKP5sRfw3ufQww/pFd07ZTwsbVHWw09QYcOA/TR3zSoLTFMStd/CNicIIg4xr1C2zsvuYb+JqPj/lTD+UELzspMfCNkqilkK3s5GU5I51PHmVgSbdJyFyD/lhtXfVL/aXuNwuTxoqyCWcCvkp+9bccq98cCctySsLvewori71lenbP6uJ0slc6Z6NB/KDkN8KeUpOO4yAwiZQYyiknnD4Fdb9ZqJUMMkt+gRQrY/wDU3pTKwGlh/2jzw14IpFIJBL/PX8Anrazm+4/2boAAAAASUVORK5CYII=>

[image40]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKYAAAAaCAYAAAA9gCd5AAAFI0lEQVR4Xu2aa8hlUxjHn8koxn3cSxnjltsgUa9I41LkLmWk1OQDH9A0X0ZIUyi3JInIJR8kmeSLKD68zZTLzJSI+EAhlySU+ER4fvOsp/Oc9e59zt5n9n7nfeesX/3rnL32OmedZ/3XWs9a+4gUCoVCoVAoFAr9cqHqZdVzmZ6ONxVqOVD1kMyNX5VuSXUKDThJdb1qg+o/1ZPp/UXxpt2Mc1VXqvbMCyZgb9VlqptUn6v+Ut0hFkP0rOoHsdi+leoUWnCd6ifVyrxgN2R/1cOq71UHZ2U7AyvPrGrf7DoDgBlzS3a9MIaDVNvEZs1pA9NcIzbbfaDaY7i4FXXGBGL8bn6xMJrTVX+ozssLpggMyRKPQTHqJMv8KGMuUT2WXyyMhvyIHOjwvGAKOVH1hupHab9ZGWXMQksYyS+JGXNpVjbNHKl6XHWPap+srI5izA45S2wn+XdeoHykujPpbdXlw8W9wBJ6l+pmsUEz37ghf1bdm5WNo6kxT1N9qvquRnz/yaovpJ+8f7XqF7HJiNOJptDur6W6zsWqP8W81Am3ijWQ3CpymJhpnSOkukFdQzrBj39PBjMVqQZB6RMGAWbwJbzpLBlpasyzVW+qlosNhG/F6sLVqtdUe6n2k36MCUeJnUq07VPq1dXBLwysnYale5OYMV/JyhgBBC1S16Cu4dCajnHonDhIusQ3PezIt6f3k9LUmMSRwQa5MTEjB/Z8BurLmP69bfuUenV1OjPmIWIzJcZk5oywQ79RhpfT88NrYFaNBhoHgebcsM0SvULMMH0Yk7SB5ZI0ZZW0a1cVmIt4EtdRXCE28CE3JpPF/WKfMYkxGVhV/cJgJ/a+j2hiTD6Dz4rMizEfETPlZ2JLdc5msXLXAek6DWC5heNVX6lmVLfLcMc8KhYogvG8WMcjDrdflUFwnlKdKXZsBXfLYObxHxuNydOWd8TqwTqxR6tN4YkM39Hl4Tqd+LrYUx5SgqYmz40Z4ffTBx532uyzsdcjbh+KxY4YnZrKvV+YcOgHhwcp4PXZ+NJWVkxvwxNisfXf8LHqkvQ6GnOF2MB2Vovl5hPDaP1Xhk2Hzok3JQg4119UbUzXeGy5VayRx4ktg+vFgkLDLk33YVbgseevYvcjNjYY24Pjy5rDLDEr9cYE6nwj1mm0xztvvvHfkMcScX0c44yJGR3i4kd6Xi9CHDBk7Jc1qn/E8lYMdWi61+u7Ufl+z+t5AujXAdNuEptgojHp89iGzmbMUZyRvWfZ84bzI/jRbjREEGk4MyFiNmJmAxrMbi3ezxLhwcmXhibGPCZdn1GtzcoWE+OMGZdyXnM/VBmTz8CQMc70GyuZP6//Pd2bx566s2LfSV/FPoll0Zhcn3dj5mYBN+aDMncX7zBb0tjbwrWVYqMwJw+OU2dM7xRYIrbcPCBm0sVKl8akX/L8lhTn2PSaVeUFsdjlsY/mY3WLqxizZdWMSXt2iTGPDu9p1Mb0mrwmGu1aGfwbiaWGvOOTQfGOus/IYAYlQPfJ3OA40ZikARzhkH5wVBGZkUHu2gbOY0klCOI4vS+Dju2DLo1Jv3guCPQLdZgxHY91HvtoTPoq5pjsQa5Kr6MxTxFLp5wbVL+F973AUsvGxc+tThgu3gHLNT8kh7w03xWC7/ImOZLJj5AAo++q3HKhgplivywTizex43qbQVy1K6/CTwFIGzibnUoYIF+qLpDp/tNJYYFBesHjPB4Xln/ZFxYULFOTpgSFQqFQKCxy/gdTRRjz2w2RRQAAAABJRU5ErkJggg==>

[image41]: <data:image/png;base64,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>
