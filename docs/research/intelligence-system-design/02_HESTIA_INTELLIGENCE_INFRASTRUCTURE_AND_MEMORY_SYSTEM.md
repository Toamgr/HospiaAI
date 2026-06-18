# **HESTIA: Foundational Intelligence Infrastructure & Memory System Architecture**

## **Part 1: Foundations of Intelligence Infrastructure**

An intelligence infrastructure in an enterprise artificial intelligence system represents the integrated, standardized layer of data models, schemas, semantic ontologies, and execution runtimes that allows an AI model to ingest, classify, trace, and reason over real-world organizational knowledge continuously1. Unlike standalone machine learning models or basic wrappers, this infrastructure functions as a unified environment where data, logic, security, and physical action execution are coupled within an organization's actual operational rules1. It provides a consistent framework to prevent information loss and semantic drift as business dynamics evolve5.  
To build a high-reliability operating system like HESTIA, clear boundaries must be established between various levels of AI systems. Table 1 defines these system tiers to differentiate HESTIA from simple consumer tools.

### **Table 1: Structural Differentiation of AI System Tiers**

| Tier | Core Concept | Architectural Characteristics | Operational Limitations |
| :---- | :---- | :---- | :---- |
| **AI Feature** | Stateless transaction | Performs a single task (e.g., text summarization, entity extraction)7 via isolated API endpoints. | No temporal memory; blind to historical and spatial contexts7. |
| **AI Assistant** | Conversational agent | Chat wrapper around an LLM with session-based memory and basic retrieval heuristics7. | Prone to hallucinations; lacks systemic validation or enterprise integration7. |
| **AI Workflow** | Linear orchestration | Chain of sequential actions or automated tools connected by rigid business logic3. | Rigid and brittle; unable to dynamically adjust to conflicting states or novel operational anomalies1. |
| **AI Knowledge Base** | Vector & semantic index | Structured or unstructured storage repository (e.g., vector index, documents, wikis)7. | Read-only; lacks belief revision, transaction logic, or kinetic execution capability7. |
| **AI Memory System** | State-tracking cognitive layer | Stateful, temporal storage that tracks belief states and revisions over time without overwrites7. | Captures state changes but lacks autonomous reasoning loops or action-triggering protocols7. |
| **AI Intelligence System** | Reason-and-reconcile layer | Synthesizes complex observations into validated claims, identifying anomalies and opportunities7. | Analyzes and interprets but depends on external systems for operational execution and writeback1. |
| **AI Operating System** | Dynamic enterprise substrate | Unified platform governing data ingestion, ontology modeling, reasoning, permissioned access, and closed-loop writes1. | Requires deep integration with legacy databases and execution gateways2. |

Before an AI system can understand a complex physical organization over time, several core layers must exist: a shared semantic ontology mapping entities and relationships2, an immutable version-controlled database that tracks changes13, a deterministic permissioning layer5, and a belief revision mechanism that handles conflicting information without losing historical context7.  
For HESTIA to understand any venue, it cannot rely on flat vector stores or basic prompt engineering. It requires a system grounded in the Basic Formal Ontology (BFO) and tailored to the physical and dynamic realities of hospitality operations16. It must model continuants (entities that persist through time, such as staff, physical dining rooms, and menu items) and occurrents (temporal events, such as a dinner service, a shift handoff, or an allergy incident)17. Operational intelligence within HESTIA relies on twenty-three core semantic primitives.

### **Table 2: Foundational Primitives of HESTIA Operational Intelligence**

| Primitive | Technical Definition | Operational Purpose | Lifecycle Stages | Required Metadata | System Representation |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Signal** | Raw, unparsed data input from external systems12. | Captures real-time digital and physical telemetry. | Ingested ![][image1] Buffered ![][image1] Parsed ![][image1] Archived. | Timestamp, Source ID, Raw Payload, Protocol Type. | JSON stream in Redis stream queue13. |
| **Observation** | Semi-structured extraction of an event or state12. | Captures a discrete event or state for downstream parsing. | Extracted ![][image1] Validated ![][image1] Correlated. | Observer ID, Event Class, Spatiotemporal Vector. | Document in vector store with parent link12. |
| **Claim** | Asserted fact extracted from one or more observations12. | Proposes a factual update to the knowledge base7. | Proposed ![][image1] Adjudicated ![][image1] Promoted/Rejected. | Subject, Predicate, Object, Creator, Creation Time. | Directed triple in long-term graph13. |
| **Evidence** | Supporting data validating or refuting a claim13. | Establishes the factual basis of knowledge nodes9. | Linked ![][image1] Weighted ![][image1] Archived. | Reference URI, Source Reliability Score, Extraction Path. | Provenance edge (evidence\_ref) to source12. |
| **Source** | Originating system, document, or human identifier13. | Tracks provenance and calculates credibility13. | Registered ![][image1] Monitored ![][image1] Deprecated. | Type, Security Clearance, Historic Accuracy Index. | Entity node with properties and keys5. |
| **Memory Item** | Atomic storage unit within the memory hierarchy12. | Persists discrete information blocks12. | Created ![][image1] Consolidated ![][image1] Decay/Pruned. | TTL, Vector Embedding, Entrenchment Index12. | JSON schema in hybrid memory database13. |
| **Entity** | Real-world resource modeled in the ontology15. | Anchors real-world objects in the digital system2. | Instantiated ![][image1] Mutated ![][image1] Decommissioned. | Class, Schema Type, Unique URI, Global UUID. | Ontological object node with dynamic properties11. |
| **Relationship** | Typed link connecting two entities2. | Maps dependencies and hierarchies11. | Declared ![][image1] Verified ![][image1] Severed. | Link Type, Cardinality, Bi-directional Flags13. | Typed edge connecting two graph nodes13. |
| **Context** | Active environment and operational state boundary7. | Isolates and bounds relevant memory for reasoning7. | Initialized ![][image1] Mutated ![][image1] Closed. | Active Roles, Spatial Constraints, Task Objective. | Ephemeral context state contract7. |
| **Hypothesis** | Proposed explanation for patterns or anomalies12. | Tests operational assumptions without committing to them. | Generated ![][image1] Simulated ![][image1] Proven/Refuted. | Trigger Event, Confidence Interval, Variables, Status. | Temporary graph branch or state machine. |
| **Assumption** | Unproven claim treated as fact due to incomplete data. | Prevents reasoning blockages when data is missing. | Adopted ![][image1] Tested ![][image1] Replaced. | Expiration Date, Parent Hypothesis, Default Value. | Annotated node attribute with low entrenchment20. |
| **Decision** | Final selection among action proposals1. | Commits the system to a specific operational choice1. | Drafted ![][image1] Approved ![][image1] Committed1. | Approver ID, Selected Action ID, Rationale String. | Immutable state node in decision audit trail1. |
| **Recommendation** | System-generated advice for human operators21. | Surfacess potential optimizations22. | Formulated ![][image1] Ranked ![][image1] Displayed ![][image1] Rated. | Confidence Score, Cost, Impact, Target Role. | Recommendation record linked to context1. |
| **Action Proposal** | Structured transaction ready for execution1. | Translates decisions into system operations1. | Staged ![][image1] Validated ![][image1] Dispatched1. | Action Type, Target Endpoint, Rollback Sequence. | Programmatic transaction envelope1. |
| **Human Review** | Mandatory gate requiring manual validation5. | Ensures safety and accuracy on critical operations5. | Escalated ![][image1] Assigned ![][image1] Resolved. | Review Type, Reviewer ID, Time Limit, Escalation Path. | State machine gate on action dispatch5. |
| **Confidence** | Quantitative belief metric in a claim or outcome9. | Measures uncertainty for the reasoning engine9. | Calculated ![][image1] Decayed ![][image1] Updated. | Sample Size, Variance, Signal Quality. | Float value ![][image2] attached to claims. |
| **Uncertainty** | Metric of missing or contradictory evidence14. | Flags knowledge gaps requiring exploration. | Calculated ![][image1] Targeted ![][image1] Reconciled. | Missing Dimension, Entropy Index, Priority. | Multi-dimensional matrix linked to entity nodes. |
| **Contradiction** | Incompatible claims within the active belief base14. | Flags data integrity and reasoning failures14. | Detected ![][image1] Isolated ![][image1] Resolved14. | Conflicting Nodes, Postulate Violated, Risk Level. | Error node linking conflicting triples14. |
| **Drift** | Gradual shift in identity or performance metrics6. | Identifies systematic alignment departures over time6. | Measured ![][image1] Flagged ![][image1] Reset. | Baseline Vector, Current Vector, Divergence Delta. | Time-series data point on core system metrics24. |
| **Pattern** | Recurring sequence of correlated observations12. | Powers proactive and predictive operational logic12. | Detected ![][image1] Modeled ![][image1] Monitored. | Support Count, Confidence Level, Pattern Formula. | Induced schema node in long-term memory graph12. |
| **Incident** | Operational anomaly violating standard rules15. | Captures service or administrative failures. | Logged ![][image1] Triaged ![][image1] Post-Mortemed. | Severity level, Linked Entities, Impact Score. | Graph event node linking participants and actions15. |
| **Lesson Learned** | Consolidated rule derived from past incidents12. | Prevents repeating historical operational failures12. | Synthesized ![][image1] Approved ![][image1] Linked5. | Source Incident UUID, Validation Count, Scope. | Rule object linked to procedural memory12. |
| **Doctrine Rule** | High-entrenchment policy guiding operational logic25. | Sets the boundary constraints of the venue2. | Codified ![][image1] Enforced ![][image1] Revised. | Authority ID, Enforcing Module, Override Rights. | Hard constraint linked to active system actions1. |

This primitive architecture prevents data from collapsing into a flat database12. By separating raw observations from validated claims, HESTIA can safely ingest real-time data streams without prematurely polluting its core knowledge model10.

## **Part 2: Core Memory Architecture**

A hospitality intelligence operating system must parse diverse streams of information, from short-term customer seating changes to decades of brand identity6. To handle these distinct lifecycles, HESTIA implements a multi-tiered memory architecture12.

### **Table 3: Memory Tiers of the HESTIA Infrastructure**

| Memory Tier | Stores | Must Never Store | Access Scope | Persistence Lifecycle | Confidence Decay Function | Contradiction Resolution | Human Review Triggers | Cross-Layer Connections |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Working** | Current conversation tokens, parsed intent frames, step state12. | Credit card numbers, raw PII, unmasked authentication tokens. | Active process or execution thread13. | Session duration (volatile)14. | Stateless, no decay. | Overwritten by newest payload7. | Never triggered. | Flushes to Session and Episodic Memory12. |
| **Session** | Current shift logs, active reservations, real-time table statuses14. | Long-term employee performance evaluations. | Floor staff, shift managers, active domain agents14. | Single shift or service window (![][image3] hours)27. | Volatile, resets to zero at session end. | Decided by active manager on the floor. | Overrides to safety protocols. | Writes back to Operational and Episodic Memory. |
| **Episodic** | Event logs of past services, specific shift handovers, incident timeline12. | Customer payment credentials. | Venue general managers, corporate analysts5. | Persistent (minimum ![][image4] years for compliance). | Static; confidence remains locked to event time. | Left as unresolved historically true contradictions. | Critical safety incidents or service failures. | Links to Semantic and Historical Memory layers12. |
| **Semantic** | Ingredient pairings, global F\&B rules, core hospitality principles8. | Venue-specific layout, employee shift assignments. | Universal read; global domain modules8. | Permanent. | Stable; increases with validation9. | Strictly verified via formal logical constraints14. | Manual change to core ontology classes11. | Feeds into Procedural and Domain modules8. |
| **Procedural** | Operational protocols, training manuals, service checklists25. | Subjective staff performance evaluations. | All active staff, managers, instructors2. | Permanent (until active revision or depreciation)7. | Immutable; stays constant until explicitly changed. | Overwritten by newer authorized manuals7. | Any change to safety or compliance checklists. | Guides Operational and Academy Memory loops2. |
| **Operational** | Daily revenue metrics, table turnover rates, supply levels15. | Detailed individual guest preferences. | General managers, F\&B directors, owners11. | Rolling ![][image5]\-year active storage, then cold archive. | Decays asymptotically if data feeds disconnect. | Resolved via database database-of-record updates11. | Revenue variances greater than ![][image6]. | Synthesized into Venue Intelligence models1. |
| **Founder** | Brand philosophy, owner risk profiles, strategic redlines7. | Transient emotional outbursts, temporary complaints. | Owners, core advisory agents, GMs5. | Indefinite; persists for brand lifetime12. | No decay; high entrenchment priority7. | Entrenched founder values override automated inputs7. | Any update to core brand vision values5. | Restricts DNA and Operational parameters1. |
| **Venue** | Menu matrices, table maps, historical supplier configurations12. | Staff salary figures, personal details. | Approved internal staff and active agents5. | Lifetime of physical venue existence. | Decay is low; validated via manual audits. | Resolved by venue manager confirmation11. | Layout modifications or ingredient changes23. | Intersects with Guest and Domain layers26. |
| **Guest** | Allergies, VIP tags, preferences, historical check averages26. | Government IDs, sensitive personal conversations33. | Front-of-house staff, host stand managers26. | Retained per guest opt-in and privacy rules27. | Decays slowly over inactive periods. | Guest-stated updates supersede automated inferences7. | High-profile VIP profiling corrections. | Feeds Service and Culinary intelligence. |
| **Staff** | Certifications, skill metrics, performance reviews15. | Confidential medical records, banking details. | HR managers, owners, and direct instructors5. | Duration of employment ![][image7] years. | Dynamic; decays without regular evaluation inputs. | Resolved via manual manager intervention. | Dispute of performance metrics by staff5. | Connects directly to Academy training tracks2. |
| **Event** | Banquet orders, floorplans, floor schedules, supplier contracts31. | Private financial discussions of organizers31. | Event planners, managers, external consultants5. | Retained for ![][image8] years post-event. | Locked after event completion. | Master banquet contract is the source of truth31. | Major changes to contracted guest count. | Feeds Operational and Beverage memory layers31. |
| **Academy** | Curriculum guides, staff assessment history, video records2. | Unmoderated staff discussion or grading comments. | Instructors, training managers, active learners2. | Lifetime of academy training program. | Stable, updated on program versions. | Instructional standards override staff disputes. | Updates to food-safety training courses. | Links Procedural memory to Staff skills2. |
| **Decision** | Commit logs, evaluated scenarios, options analysis1. | Ephemeral options evaluated during simulation. | Owners, general managers, system auditors5. | Immutable; permanent retention13. | Absolute stability (zero decay). | Handled via branching time-travel logs7. | Review of automation override events5. | Connects Operational to Historical memory. |
| **Reputation** | Review aggregation, sentiment histories, trend metrics26. | Private personal profiles of online reviewers. | Marketing teams, general managers, owners. | Rolling ![][image8] years. | Decays logarithmically; recency is prioritized. | Resolved by cross-correlating review platforms. | Customer review drops below 3 stars. | Feeds Service and Brand-drift analysis6. |
| **Historical** | Consolidated annual metrics, menu histories, old structures12. | Transient, day-to-day operational noise14. | Strategic planners, business consultants5. | Indefinite. | Static; constant confidence. | Left as historically accurate diverging timelines. | Strategic changes to long-term plans. | Consolidates all episodic metrics annually12. |
| **Audit** | Cryptographically signed access logs, system changes5. | Payload content of encrypted data streams35. | Security auditors, system administrators5. | Immutable; permanent13. | Volatility is zero; cryptographically secured. | No contradiction allowed; system halts on mismatch. | Any database tampering or breach attempts5. | Spans all layers to verify data integrity5. |

### **The Minimum Viable Memory Architecture**

For the HESTIA alpha release, developers must avoid overengineering a fifteen-layer system12. The system can function with a simpler, highly robust Minimum Viable Memory Architecture (MVMA) containing four core layers:

1. **Working & Session Memory (Volatile)**: Implemented in Redis, this layer tracks active reservation states, real-time table assignments, and conversational intents during shifts13.  
2. **Episodic & Operational Event Log (Immutable append-only)**: A relational database schema (e.g., PostgreSQL) that records every service transaction, shift report, and guest visit as it occurs, establishing a verifiable timeline12.  
3. **Ontological Semantic & Venue Memory (Graph-Native)**: Implemented in Neo4j, this layer stores physical venue structures, menu layouts, ingredient dependencies, and role definitions as a unified network of objects and links13.  
4. **Founder & Brand Identity Store (High-Entrenchment Document Store)**: A document collection storing core philosophy statements and operational constraints7. These files serve as high-priority constraints that override temporary data during system reasoning7.

  \[Redis Working/Session Memory\] (Volatile floor telemetry & active intent maps)  
                │  
                ▼ (Shift close triggers synthesis)  
  \[PostgreSQL Immutable Event Store\] ───► \[Neo4j Ontological & Venue Graph\]  
  (Telemetry, transactions, shift logs)     (Continuant objects, links, and dependencies)  
                ▲                                     ▲  
                │                                     │  
                └───────── \[Founder DNA Store\] ───────┘  
                     (High-entrenchment constraints)

This four-layer setup balances real-time speed, transactional consistency, semantic richness, and strict compliance with brand guidelines1.

## **Part 3: Generic vs. Venue-Specific Intelligence**

To serve multiple venues without leaking proprietary data, HESTIA's architecture must isolate different types of knowledge36. It must distinguish between universal principles, tenant-specific customizations, venue-level layouts, and role-specific views10.

### **Table 4: Knowledge Scoping and Separation Matrix**

| Scope | Knowledge Types | Access Boundaries | Isolation Mechanism | Example Data Point |
| :---- | :---- | :---- | :---- | :---- |
| **Global** | Generic culinary chemistry28, standard beverage classifications, service principles38, public allergy protocols. | Read-only access across all tenants and modules8. | Global schema database partition, completely isolated from tenant data29. | "A classic Negroni contains equal parts gin, sweet vermouth, and Campari"39. |
| **Tenant** | Multi-venue group operations, brand-wide guidelines, central HR structures, shared suppliers26. | Isolated to parent tenant identity36. | Cryptographically isolated schema using tenant-specific Key Encryption Keys (KEKs)10. | "The hospitality group targets a food cost variance of less than 2%"23. |
| **Venue** | Menu layout23, floor map31, staff assignments, vendor schedules, equipment metrics. | Restricted to authorized venue staff and parent tenant admin5. | Namespace partition or isolated database instance with role-based policies36. | "Table 12 is a 4-top located in the west corner of the dining room next to the service station." |
| **Role** | Management reports, system settings, staff skill sheets, raw transaction histories5. | Restricted to specified user roles5. | Row-level security (RLS) policies10. | "Line Cook X completed level-2 allergen validation tests"2. |
| **Session** | Current reservation list, live kitchen ticket times, table assignments14. | Volatile session state for active staff on duty14. | Isolated Redis cache partition with automated post-session purging27. | "Table 4 is waiting on entree preparation for 14 minutes." |

### **Multi-Tenant Isolation Model**

To prevent knowledge contamination across venues, HESTIA uses a multi-layered security architecture:

1. **Storage Isolation**: The system implements a **Schema-per-Tenant** or **Database-per-Tenant** model10. High-risk tiers run on physically separated database instances10. For mid-tier deployments, database isolation is enforced using PostgreSQL Row-Level Security (RLS) linked directly to the application connection pool10.  
2. **Cryptographic Segmentation**: The system uses **Application-Level Encryption (ALE)**35. Each tenant is assigned a unique Key Encryption Key (KEK) managed in an external cloud Key Management Service (KMS)10. All sensitive data fields (such as guest notes, owner statements, and staff profiles) are encrypted in the application layer before being written to disk35. This enables **cryptographic shredding**; deleting a tenant's KEK renders their entire data footprint permanently unreadable10.  
3. **Vector Database Partitioning**: The vector engine secures data using a **Namespace-per-Tenant** or **Index-per-Tenant** structure10. Retrieval queries must hardcode the active tenant identifier at the driver level, making cross-tenant data leaks impossible10.  
4. **Active Session Ephemerality**: High-security zones use **Burn-After-Use (BAU) Session Semantics**27. When a service session ends, the associated temporary context caches, prompt histories, and intermediate reasoning vectors are programmatically destroyed, leaving only aggregated metrics27.

  \[API Gateway with JWT & Tenant ID\]  
                │  
         (Context Envelope)  
                ▼  
  \[Application Layer ALE Engine\] ◄──────── \[Cloud KMS\] (Tenant-scoped KEKs)  
                │                               │  
         (Fields Encrypted)              (Crypto Shredding Point)  
                ├──► \[PostgreSQL Schema-per-Tenant\] (RLS Enforced)  
                └──► \[Vector Store Namespace Partition\] (Hardcoded Tenant Filters)

## **Part 4: Venue Memory Foundation**

Venue Memory serves as HESTIA's raw and semi-structured ground-truth layer12. Unlike synthesized intelligence, Venue Memory preserves original operational data without prematurely drawing conclusions or flattening contradictions7.

### **Table 5: Venue Memory Ingestion and Schema Mapping**

| Category | Ingestion Data Type | Primary Source | Confidence Level | Freshness TTL | Sensitivity Level | Access Scopes | Review Requirements | Relationship to DNA & Intelligence |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Founder Statements** | Unstructured transcript, text document12. | Voice logs, initial design docs12. | High (![][image9])7. | Indefinite (![][image10] years). | High | Owner, Strategic Planners5. | Manual owner verification required. | Establishes top-level constraints for brand rules12. |
| **Venue Facts** | Semi-structured JSON, spatial data. | Blueprints, POS setup, configuration23. | Absolute (![][image11]). | ![][image12] year (or until layout edit). | Low | All authorized venue staff. | Approved by GM upon integration. | Defines physical limits for operational logic. |
| **Operational Observations** | Unstructured shift notes, sensor telemetry12. | Shift checklists, IoT sensors12. | Medium (![][image13]). | ![][image14] hours. | Low | Managers, F\&B Directors11. | None (automatic ingestion). | Ingested to detect operational trends12. |
| **Guest Feedback** | Unstructured reviews, notes26. | SMS, OpenTable, Google Reviews26. | Low (![][image15])12. | ![][image16] days. | Medium | Hosts, Floor staff, Managers26. | Dynamic validation by system. | Refines service profiles and flags guest issues6. |
| **Menu Data** | Structured schema with dependencies21. | POS, supplier invoices23. | Absolute (![][image11]). | Real-time invoice update23. | Medium | Chefs, Bar Managers, GMs. | Automatic via supplier match23. | Used to calculate margins and engineering states23. |
| **Beverage Data** | Structured recipe graphs39. | Bar recipe books39. | Absolute (![][image11]). | Permanent. | Low | Bartenders, Beverage Directors. | Curated by Bar Manager. | Supports inventory and pairing analysis39. |
| **Service Notes** | Unstructured narrative text. | Server shift logs, host diaries26. | Medium (![][image17]). | ![][image4] days. | Medium | FOH Managers, Captains26. | None. | Detects bottlenecks and staff training needs12. |
| **Staff Notes** | Semi-structured performance evaluations. | Manager performance reviews5. | Medium (![][image17])7. | Rolling ![][image12] year. | High | Owners, GMs, direct instructors5. | Requires mutual HR signature. | Identifies training gaps and academy paths2. |
| **Event History** | Structured event files31. | Tripleseat contracts, floor plans31. | High (![][image18]). | Permanent. | Medium | Event coordinators, planners. | Confirmed on event close. | Tracks operational loads and banquet metrics31. |
| **Incident Reports** | Structured form fields with narratives. | Digital incident log sheets15. | High (![][image9]). | Permanent. | High | GMs, Owners, Legal consultants. | Mandatory GM approval on close5. | Synthesizes risk alerts and lessons learned12. |
| **Shift Reports** | Unstructured text template. | Nightly manager summary logs14. | High (![][image19]). | Rolling ![][image16] days. | Medium | GM, Owner, F\&B Director. | Approved by GM daily. | Used to extract daily operational insights12. |
| **Reputation Signals** | Unstructured reviews with metrics26. | Google, Yelp, TripAdvisor scraping26. | Medium (![][image20]). | Rolling ![][image21] days. | Low | PR Managers, F\&B Directors. | Automated scraping. | Monitors customer sentiment and identity consistency6. |
| **Training Outcomes** | Structured assessment scores2. | Academy LMS system2. | Absolute (![][image11]). | ![][image5] years. | Medium | Instructors, GM, Employees5. | Automatic on exam submission. | Feeds staff skill matrices and service capacity. |
| **Financial Signals** | Structured transaction tables. | Accounting APIs, POS reports15. | Absolute (![][image11]). | ![][image14] hours. | High | Owners, GMs, CFOs. | Audited on monthly reconciliation. | Guides menu engineering and pricing adjustments23. |
| **Supplier Constraints** | Structured delivery lead times. | Vendor agreements, order forms23. | High (![][image18]). | Rolling ![][image21] days. | Medium | Chefs, Purchasing agents. | None. | Maps inventory and cost variables23. |
| **Spatial Constraints** | Vector spatial coordinate arrays. | Dynamic floor plan configurations26. | Absolute (![][image11]). | Permanent. | Low | Hosts, Managers, Event teams. | None. | Guides real-time seat mapping and logistics41. |
| **Policy Constraints** | Structured rule declarations. | Employee handbooks, safety rules5. | Absolute (![][image11]). | Permanent. | Medium | Owners, GMs, HR. | Approved by corporate legal. | Enforces strict operational boundaries1. |
| **Kosher Constraints** | Structured Boolean dependencies. | Certifier manuals, ingredient specs. | Absolute (![][image11]). | Permanent. | Low | Kitchen team, Mashgiach5. | Verified by certifying rabbi. | Enforces ingredient isolation and prep rules. |
| **Brand Statements** | Unstructured brand narratives. | PR kits, website copy, style guides. | High (![][image18]). | Permanent. | Low | Marketing, Creative Director. | None. | Establishes the target brand identity baseline6. |
| **Historical Changes** | Ephemeral event stream13. | Database revision histories13. | Absolute (![][image11]). | Permanent. | High | System administrators5. | Audit-logged only13. | Reconstructs past states for trend analysis7. |

### **Storing Memory Without Premature Conclusions**

To keep raw data distinct from derived logic, HESTIA divides its storage using a dual-stage architecture:

* **The Immutable Landing Stage (Occurrent Ledger)**: All raw data streams are written to an append-only transaction ledger13. This ledger acts as a permanent record of events7.  
* **The Claim-Evidence Schema (Linked Entity Graph)**: An LLM parses the landing stage to extract structured entities, links, and claims12. These claims are not directly merged into active venue facts12. Instead, they are stored as proposed assertions connected to their source via an evidence edge:

![][image22]  
A claim only becomes a confirmed venue fact after meeting specific verification rules, such as a manual manager signature or high-frequency co-occurrence across multiple shift reports12. This preserves raw historical details and prevents false deductions7.

## **Part 5: Venue Intelligence Foundation**

Venue Intelligence functions as the system's reasoning layer, synthesizing raw memories into actionable interpretations7.

### **The Synthesis Pipeline**

To transform raw data into intelligence, HESTIA uses a multi-step synthesis process:

  \[Raw Event Ledger\]  
          │  
          ▼  
  \[Entity & Claim Extraction\] (Constructs proposed relationships with evidence links)  
          │  
          ▼  
  \[Ontological Alignment & Check\] (Checks claims against BFO schemas and brand rules) \[cite: 14, 17\]  
          │  
          ▼  
  \[Temporal & Bayesian Weighting\] (Evaluates confidence, decay, and consistency metrics) \[cite: 9, 14\]  
          │  
          ▼  
  \[Multi-Hop Graph Reasoning\] (Correlates across service, F\&B, and operational domains) \[cite: 14, 39\]  
          │  
          ▼  
  \[Validated Insight Synthesis\] (Flags drift, bottlenecks, and strategic opportunities)

### **Analytical Detection Models**

HESTIA detects operational anomalies and shifts by analyzing patterns across diverse data streams:

* **Operational Bottlenecks**: The system monitors ticket-to-table delivery durations. If ticket preparation times exceed the average service time (![][image23]) for three consecutive weekends, the system flags a bottleneck, maps it to current staffing levels, and suggests pre-prep scheduling adjustments.  
* **Identity Drift**: The system uses vector embeddings to compare daily menus and customer reviews against core brand guidelines6. If the cosine distance between the daily menu items and the target brand values exceeds a set threshold, the system flags an identity drift warning6.  
* **Guest Expectation Gaps**: The system correlates reservation notes with shift summaries26. If a guest who has requested quiet tables (![][image5] times in SevenRooms) is seated near high-traffic server stations (![][image24] times in episodic logs), HESTIA flags a service mismatch and updates the host-stand rules26.  
* **Staff Capability Gaps**: By pairing point-of-sale data with employee files, HESTIA monitors performance trends15. If a server has lower check averages for high-margin dishes (![][image25] below floor average) and shows low completion scores on corresponding menu training modules (![][image26] on the LMS), the system flags a capability gap and assigns targeted training2.

### **Evidence Thresholds for Reasoning Claims**

Before asserting an operational pattern, HESTIA requires specific quantities and types of evidence to maintain reasoning accuracy:

               \[Factual Verification Index\]  
                 
   1.00 ┼───────────────────────────────── \[Absolute Verification\]  
        │                                  \- Direct source API sync  
   0.85 ┼────────────────── \[Strong Pattern\] \- POS invoice matched recipe  
        │                   \- 3rd-party review correlates  
        │                   \- Co-occurrence: \>5 shifts  
   0.65 ┼── \[Weak Signal\]   \- Multi-source narrative triangulation  
        │   \- Recurrent incident logs  
        │   \- Co-occurrence: 3 shifts  
   0.40 ┼────────────────── \[Hypothetical Assumption\]  
        │                   \- Single-source shift report  
   0.00 ┴────────────────── \- Unverified observation

If these criteria are not met, HESTIA assigns a low confidence score to the claim, flags it as requiring human review, and prompts staff to verify the detail during service5.

## **Part 6: Venue DNA Foundation**

Venue DNA represents the stable, core identity of a hospitality establishment6. To ensure the system remains reliable, HESTIA must distinguish between permanent brand principles and temporary operational adjustments6.

### **Table 6: Stable DNA vs. Evolving Interpretations**

| Identity Dimension | Stable DNA (Core Rules) | Evolving Interpretation (Temporary States) |
| :---- | :---- | :---- |
| **Founder Vision & Values** | Core purpose (e.g., "Fine dining farm-to-table focus on regional heirloom grains")12. | Seasonal priority changes (e.g., "Using imported wheat temporarily due to local harvest failures")23. |
| **Hospitality Philosophy** | Service promise (e.g., "Formal European table service with highly trained staff")38. | Temporary operational adjustments (e.g., "Simplified step-of-service checklist due to rapid staff turnover")2. |
| **F\&B Profile** | Identity markers (e.g., "Classic low-waste cocktail program emphasizing local botanicals")39. | Limited-time menu changes (e.g., "Using out-of-season fruit purees for a high-volume event")31. |
| **Financial Guidelines** | Profit targets (e.g., "Maintain a minimum food cost contribution margin of $12 per entree")42. | Short-term tactical pricing (e.g., "Discounting bar items during off-peak weekdays to boost traffic"). |

### **Preventing Operational Noise from Polluting Brand DNA**

To protect core identity parameters from being overwritten by daily operational variations, HESTIA applies an **Epistemic Entrenchment Hierarchy**7. True DNA principles are assigned high default entrenchment weights (![][image27])7. Daily operational metrics, such as a sudden rise in recipe ingredient costs or a string of negative service reviews, are logged as transient anomalies in episodic memory (![][image28])12.  
If a venue experiences persistent operational changes, such as a kitchen shift supervisor using pre-packaged ingredients for three consecutive weeks, the system does not alter the core DNA profile14. Instead, it generates an **Identity Drift Alert**6:  
![][image29]  
This alert notifies management that current daily operations are drifting away from the venue's stated identity, prompting a review rather than adapting the system to the drift6.

### **The Venue DNA Lifecycle Model**

Venue DNA transitions through verified, version-controlled stages:

  \[Draft DNA State\] ──► \[Manager Review\] ──► \[Active DNA Guardrails\] ──► \[Drift Detection Monitoring\]  
                             │                      │                                 │  
                             ▼ (Rejected)           ▼ (Revision triggers)             ▼ (Drift flagged)  
                      \[Discard State\]        \[Archived Historical DNA\]        \[Correction Workflow\]

Every modification to the core DNA is version-controlled and stored in an immutable historical ledger, allowing managers to audit identity changes over the venue's lifecycle6.

## **Part 7: Founder Memory & Founder Digital Twin Foundation**

The Founder Digital Twin (FDT) is a specialized reasoning system designed to evaluate operational recommendations against the owner's core philosophy and business rules7.

### **Table 7: Founder Identity Schema & Classification Logic**

| Dynamic Class | Internal Concepts | Persistence Lifecycle | Epistemic Status | Verification Protocols | Action Constraints |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Founder Vision** | Long-term brand objectives, target audience profile6. | Lifetime of the active business entity. | Permanent Belief7. | Requires direct, double-factor owner signature. | Rejects any automated workflow that conflicts with core brand goals1. |
| **Founder Values** | Ethical principles, labor standards, quality baselines12. | Lifetime of the active business entity. | High Entrenchment Rule7. | Checked against the venue's written charter25. | Prevents the system from suggesting low-cost, low-quality suppliers23. |
| **Founder Fears** | Reputational risks, service concerns, operational issues12. | Indefinite. | Monitored Risk Boundary. | Extracted from onboarding logs and interview files12. | Automatically flags high-risk events or menus for manual approval5. |
| **Founder Taste** | Ingredient choices, design rules, styling preferences12. | Evolving over multi-year cycles. | Dynamic Preference7. | Learned via review patterns and input approvals14. | Suggests stylistic adjustments to menus and guest spaces22. |
| **Decision Style** | Risk levels, operational preferences, financial thresholds12. | Permanent. | Cognitive Behavioral Heuristic44. | Learned from historical decision approvals13. | Sets the balance between automated adjustments and human-in-the-loop approvals5. |

### **Distinguishing Intent in Founder Memory**

An operational AI must separate casual comments from systemic business principles7. If a founder remarks during a busy shift that "we should stop serving steak tonight," a basic system might delete the dish from the active menu7. HESTIA's architecture prevents this by categorizing founder inputs into five distinct states:

* **Stray Observations (![][image30])**: Isolated, single-session statements logged without systemic validation. Retained in session memory and kept out of active routing rules7.  
* **Systemic Beliefs (![][image31])**: Claims repeated across three or more separate sessions, or explicitly stated in core planning documents7.  
* **Decisions (![][image32])**: Formal, signed-off directives tied to specific operational parameters (e.g., "The maximum food cost margin for any pasta dish is 22%")13.  
* **Explorations (![][image33])**: Low-priority ideas flagged for testing (e.g., "Let's explore organic wines next month")9. The system supports these with low-risk recommendations without altering core menu settings.  
* **Retracted Beliefs (![][image34])**: Stated ideas that have been superseded by new directives7. The system archives these to preserve historical context7.

  \[Unstructured Founder Input\]  
               │  
      (Temporal Parser)  
               ▼  
       Is it a structured directive?  
              ├──► YES ──► \[Immutable Decision Node\] (Linked to active routing rules)  
              └──► NO  ──► Check co-occurrence frequency across shifts  
                            ├──► High Frequency (\>=3) ──► Promote to \[Systemic Belief\]  
                            └──► Low Frequency  (\<3)  ──► Store as \[Stray Observation\]

This classification loop ensures the system remains aligned with the founder's true business rules, avoiding erratic adjustments driven by transient operational stress6.

## **Part 8: Confidence, Evidence, and Uncertainty Infrastructure**

To prevent false assumptions in busy hospitality environments, HESTIA measures confidence and uncertainty across all operations10.

### **The Computational Confidence Model**

The system calculates its confidence (![][image35]) in any factual claim at time ![][image36] using three metrics: evidence weight (![][image37]), source reliability (![][image34]), and information consistency (![][image38]). The base confidence ![][image39] is calculated as:  
![][image40]  
where ![][image41] are weighting parameters such that ![][image42]. The system decays this confidence over time to reflect changing operational conditions:  
![][image43]  
where ![][image44] represents the temporal decay rate, and ![][image36] is the elapsed time since the claim was last verified.

### **Table 8: Source Reliability and Information Credibility Matrix**

| Source Category | Base Reliability (R) | Evidence Weighting (W) | Decay Coefficient (λ) | Primary Verification Pathway |
| :---- | :---- | :---- | :---- | :---- |
| **System API** | **![][image11]** | **![][image11]** | **![][image45]** (Virtually static) | Direct schema alignment and transaction receipt23. |
| **Staff Input (App)** | **![][image19]** | **![][image46]** | **![][image47]** (Daily decay) | Cross-correlation with shift reports and POS logs14. |
| **Manager Log** | **![][image18]** | **![][image18]** | **![][image48]** (Weekly decay) | Manual confirmation by another manager5. |
| **Guest Note** | **![][image17]** | **![][image15]** | **![][image49]** (Rapid decay) | Verification by floor staff during service26. |
| **Scraped Review** | **![][image50]** | **![][image51]** | **![][image52]** (Monthly decay) | Cross-checking across review platforms26. |

### **Preventing False Certainty and Handling Contradictions**

To avoid incorrect assumptions, HESTIA implements two primary safety protocols:

* **Active Contradiction Isolation**: If two conflicting claims are detected within the active system (e.g., ![][image53]: "Table 4 is dirty" and ![][image54]: "Table 4 is clean"), HESTIA does not attempt to average the text14. It flags a contradiction, lowers the confidence score to zero, and alerts floor staff to perform a physical check14.  
* **Active Sensing Loop**: When confidence in a critical operational state falls below a set threshold (![][image55]), HESTIA pauses automated recommendations and prompts staff with a verification request (e.g., "Confirm current keg level for IPA before next order").

  \[Ingested Claim Update\] ──► Check Active Belief Base  
                                      │  
                         Are there conflicting nodes?  
                                      ├──► YES ──► \[Isolate Contradiction\]  
                                      │             \- Drop confidence to 0.0  
                                      │             \- Alert floor staff  
                                      │             \- Halt automated actions  
                                      └──► NO  ──► Apply dynamic decay formula

This protocol ensures that HESTIA's automated workflows are driven by verified operational facts, protecting service quality1.

## **Part 9: Human Review and Decision Rights Infrastructure**

To keep AI recommendations aligned with real-world operations, HESTIA maps exactly what the system can execute automatically, what it must recommend for approval, and what requires manual oversight1.

### **Table 9: HESTIA Decision Rights and Review Matrix**

| Category | Automated Actions | Recommendation Actions | Drafting Actions | Prohibited Decisions | Approval Roles | Log Requirements | Reversibility |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Venue DNA Updates** | None. | Flag identity drift6. | Draft potential DNA updates for review6. | Making unauthorized edits to core brand DNA6. | Owner5. | Full semantic diff on the metadata ledger13. | Fully reversible (versioned rollbacks)13. |
| **Founder Memory** | None. | None. | Draft core belief templates based on founder logs12. | Writing or editing core founder beliefs7. | Owner5. | Timestamp, original text, and approval signature. | Fully reversible13. |
| **Guest Memory** | Clean session data27. | Propose allergy warnings26. | Draft profile updates from reservation notes26. | Direct edits to medical allergy flags26. | Host GM, Front-of-House Manager5. | User ID of editing host and change log. | Reversible. |
| **Staff Records** | Log shift attendance times. | Flag training gaps2. | Draft staff feedback templates based on performance data5. | Terminating staff or editing pay levels5. | General Manager5. | ISO 27001-compliant action logs2. | Reversible. |
| **Menu Strategy** | Synchronize item sales totals. | Highlight star/dog menu items22. | Draft updated menus based on pricing models23. | Changing prices on active POS systems23. | F\&B Director, Owner11. | Cost models and invoice references23. | Reversible (previous POS menu state). |
| **Pricing Adjustments** | None. | Propose price changes21. | Draft targeted price scenarios for events31. | Changing item prices on active POS menus23. | F\&B Director, GM5. | Historical elasticity data and price models. | Reversible. |
| **Event Planning** | Reserve draft event slots31. | Propose vendor scheduling31. | Draft Banquet Event Orders (BEOs)31. | Committing to event pricing or contracts31. | Event Manager, GM31. | Customer communications and layout maps31. | Reversible. |
| **Operational Moves** | Send prep alerts to kitchen screens. | Suggest shift schedule adjustments. | Draft floor assignments based on shift trends. | Modifying active kitchen station assignments. | Kitchen Manager, Chef11. | Timestamp, role-assignment diff. | Reversible. |
| **Reputation Management** | None. | Highlight low-rating reviews26. | Draft replies to guest reviews26. | Posting unapproved replies to public review sites26. | Marketing Lead, GM. | Draft text, target review URI, approval ID. | Irreversible once posted. |
| **Training Academy** | Assign baseline food-safety courses2. | Suggest skill certifications2. | Draft test questions for new menu items2. | Editing final student assessment grades2. | Academy Instructor5. | Course completion logs and scores2. | Reversible. |

Every automated change and manual override is recorded in an append-only audit trail5. This keeps HESTIA's operations transparent and auditable for management1.

## **Part 10: Role, Permission, and Memory Access Infrastructure**

HESTIA uses Role-Based Intelligence Access Control (RBIAC) to enforce secure boundaries, ensuring staff members only access data relevant to their operational roles5.

### **Table 10: Role-Based Access Control and Intelligence Scoping Matrix**

| Role | Memory Read Scope | Memory Write Scope | Memory Review Rights | Active Intelligence Scope | Approved Action Limits | Aggregated & Anonymized Scopes | Prohibited Views |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Owner** | Full read access across all tiers5. | Full write access. | Approves DNA and founder memory changes5. | Core strategic metrics and brand-drift indicators6. | Approves top-level pricing and menu updates23. | No anonymization required (full visibility). | None. |
| **Admin** | System architecture, technical parameters11. | System settings. | Technical configuration changes5. | System health and API status alerts. | Approves database updates and API connections. | Personal guest data and employee conversations5. | Raw business strategic financials. |
| **General Manager** | Operational, Venue, Guest, Staff, and Academy2. | Operational entries. | Verifies shift reports, incident logs5. | Shift metrics, staffing models, revenue performance15. | Approves staff schedules and vendor orders23. | Personal staff files and customer communications5. | Strategic corporate financial ledger. |
| **F\&B Director** | Venue, Menu, and Supplier datasets23. | Menu items. | Reviews menu costs, recipe formulas23. | Star/Dog quadrant patterns, cost metrics21. | Approves recipe changes and supplier switches23. | Personal customer notes26. | Human Resource salary files5. |
| **Bar Manager** | Beverage, Supplier, and FOH datasets31. | Beverage recipes. | Verifies drink recipes, inventory levels39. | Beverage cost trends, pairing opportunities39. | Approves liquor orders and bar menu updates23. | Non-bar guest preferences26. | Kitchen food safety records. |
| **Service Manager** | Guest profiles, service logs, shift templates26. | Service notes26. | Reviews host stand assignments, VIP lists26. | Front-of-house bottleneck analyses26. | Approves reservation changes, seating shifts41. | Personal employee records5. | Supplier procurement invoices23. |
| **Event Manager** | Event details, banquet logs, contracts31. | Event files31. | Verifies banquet contracts, event proposals31. | Event space revenue and scheduling trends31. | Approves event orders and scheduling31. | Non-event customer profiles26. | Employee performance reviews5. |
| **Academy Instructor** | Academy curricula, student grades2. | Student grades2. | Reviews test questions, lesson plans2. | Training performance trends, skill metrics2. | Approves student completions and skills2. | Raw personal employee files5. | Revenue records, vendor invoices23. |
| **Employee** | Target schedule, daily checklists, skill cards2. | Assigned checklists. | None. | Personal skill progress, shift goals2. | Confirms completed shift tasks3. | All team-wide metrics (personal view only). | Peer performance files, venue financials5. |
| **Consultant** | Aggregated financial and reputation data5. | None. | None. | Macro revenue patterns, review sentiment. | None (Read-only access)2. | All employee PII, specific guest names5. | Raw founder statements12. |

### **RBIAC Implementation Architecture**

The security model is built directly into the database query engine:

* **FOH Anonymization Gate**: Front-of-house screens display operational preferences (e.g., "Allergy: Peanuts"26) but hide sensitive details (e.g., "Reviewer rating: High" or "Average spent: High") from general staff view33.  
* **Staff Anonymization Rule**: General performance metrics (such as task completion rates and sales performance2) are anonymized when shown to peers, preventing competitive friction while still highlighting areas for operational improvement5.

## **Part 11: Domain Intelligence Module Foundation**

HESTIA uses specialized domain intelligence modules to process domain-specific knowledge and feed validated insights back into the core system ontology3.

### **Table 11: Domain Modules and Interaction Patterns**

| Domain Module | Required Global Knowledge | Venue-Specific Memory | Input Signals Consumed | Output Recommendations | Proposed Actions | Review Requirements | Writeback Pattern | Ontological DNA & ID Contributions |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Beverage** | Cocktail structures39, legal ABV values, ingredient groupings. | Bar layout, current bar menu, suppliers23. | POS drink logs15, invoice price files23, keg weights. | Proposes recipe ingredient replacements to maintain margins23. | Generate supplier purchasing orders23. | Bar Manager verification5. | Updates active drink recipe costs in Neo4j13. | Refines drink cost parameters in the venue profile6. |
| **Culinary** | Nutrient densities28, classic pairings, allergen rules. | Kitchen space layout, active menu23. | Ingredient prices23, dish waste weights, order counts. | Recommends menu adjustments based on margin patterns22. | Update prep lists on kitchen screens. | Chef review before menu updates5. | Adjusts food recipe costs and alerts in the graph13. | Refines food quality standards in Venue DNA6. |
| **Service** | Service principles38, table steps, psychology. | Table maps26, server schedules, role guides. | Reservation arrivals26, service times, server table logs. | Recommends dining room station changes to balance seating loads41. | Send guest seating alerts to host tablets26. | Service Manager review. | Logs service speed metrics to Episodic Memory12. | Shapes target step-of-service guidelines6. |
| **Event** | Planning structures, spacing rules, compliance31. | Room layouts31, rental inventories, sound limits. | Leads, contract drafts31, room schedules, event plans. | Proposes custom event proposals and layout changes31. | Send contract drafts to client emails31. | Event Manager signature31. | Writes event profiles to Event Memory13. | Tracks historic event metrics in Brand profiles6. |
| **Academy** | Safe-handling rules, training methods2. | Onboarding steps, venue rules2. | Test outcomes2, recipe steps, staff attendance. | Proposes custom training plans to cover skill gaps2. | Schedule training sessions on staff calendars2. | Lead Instructor signature5. | Updates staff profiles in the database2. | Syncs team capability levels with Venue DNA rules6. |
| **Guest** | Behavior rules, segment groupings33. | Guest notes26, history log, allergy lists. | Reservation data26, direct emails, seating choices. | Proposes personalized menu suggestions for returning guests26. | Send customized welcome templates to FOH26. | GM review for VIP profiles5. | Saves validated guest details to Guest Memory13. | Refines target customer profiles in Venue DNA6. |
| **Reputation** | NLP rules, platform schemas, brand standards. | Historic reviews26, target tone24. | New reviews, brand feedback26, media comments. | Proposes public review responses matching brand tone24. | Alert marketing team to urgent reviews26. | GM signature before publication5. | Logs sentiment trend scores to Reputation Memory13. | Refines brand consistency metrics over time6. |
| **Operations** | Equipment specs, standard shift timing rules. | Facility layouts, HVAC schedules, supplier lead times23. | Energy use stats, sensor status, maintenance logs. | Proposes preventive equipment service intervals. | Generate maintenance alerts for technicians. | GM review. | Writes service events to Operational Memory13. | Highlights operational utility costs in DNA files6. |
| **Multi-Venue** | Multi-unit management and pricing models. | Brand-wide supplier rates23. | POS transaction flows15, venue supply levels23. | Proposes bulk stock transfers between active locations. | Dispatch transfer invoices to logistics systems. | Corporate CFO signature5. | Writes transfer logs to Operational Memory13. | Identifies operational performance gaps6. |

### **Preventing Domain Isolation**

To prevent domain modules from operating as disconnected tools, HESTIA routes all communications through a central **Ontological Core**8. Modules cannot write directly to databases11. Instead, they submit structured transactions to the central pipeline using an execution wrapper:

JSON  
{  
  "transaction\_id": "tx\_bev\_9921\_abc",  
  "source\_module": "BeverageIntelligence",  
  "target\_entity": "urn:hestia:tenant-A:venue-1:menu-item:negroni",  
  "proposed\_action": "SET\_PROPERTY",  
  "property\_diff": { "recipe\_food\_cost": 3.12 },  
  "evidence": {  
    "source\_ledger\_ref": "urn:hestia:tenant-A:venue-1:invoice:88712",  
    "verification\_method": "invoice\_ingredient\_cost\_calc"  
  }  
}

The Ontological Core validates this update, verifies permissions, checks for contradictions, and updates the shared graph database13. This design ensures that changes in one domain (e.g., a recipe cost update in Beverage) immediately update related systems (e.g., pricing metrics in Culinary and Operational reports)15.

## **Part 12: Intelligence Loop Design**

HESTIA's continuous learning loop ingests real-world operational signals, evaluates them against brand guidelines, and logs verified outcomes back into system memory6.

┌────────────────────────────────────────────────────────────────────────────────────────┐  
│                                       HESTIA LOOP                                      │  
├───────────────┬──────────────────────────┬─────────────────────────┬───────────────────┤  
│ \[Signal In\]  ─┼─► \[Context Verification\] ┼─► \[Entity Check\]       ─┼─► \[Claim Parse\]   │  
│ (Raw logs/APIs)│   (Contract setup)│   (Graph matches) │   (Extract facts) │  
├───────────────┼──────────────────────────┼─────────────────────────┼───────────────────┤  
│ \[Decide Path\]◄┼─  \[Contradiction Test\]  ◄┼─  \[Confidence Analysis\] ◄┼─  \[Evidence Match\]│  
│ (Route query) │   (Check logic) │   (Calculate values)    │   (Link sources)  │  
├───────────────┼──────────────────────────┼─────────────────────────┼───────────────────┤  
│ \[Draft Move\] ─┼─► \[Human Oversight Gate\] ┼─► \[Execute Action\]     ─┼─► \[Writeback\]     │  
│ (Synthesize)  │   (Access checks)  │   (POS/API write) │   (Update graph)  │  
├───────────────┼──────────────────────────┼─────────────────────────┼───────────────────┤  
│ \[Audit Log\]  ◄┼─  \[Outcome Analytics\]   ◄┼─  \[Feedback Assessment\] ◄┼─  \[Telemetry In\]  │  
│ (Signed logs) │   (Track metrics)        │   (Verify goals)        │   (Read updates)  │  
└───────────────┴──────────────────────────┴─────────────────────────┴───────────────────┘

### **Table 12: Execution Stages of the HESTIA Intelligence Loop**

| Step | Stage Name | Operational Process | System Inputs | System Outputs | Failure Modes | Validation Methods | | :--- : | :--- | :--- | :--- | :--- | :--- | :--- | | **1** | **New Signal Ingestion** | Reads raw data from connected external systems12. | POS logs15, reservation streams, sensor data. | Standardized payload stream. | Input buffer block, API dropout. | Checksums, connection status checks. | | **2** | **Context Verification** | Loads task-specific context data and rules7. | Ephemeral active role data7. | Active context contract7. | Missing context, role mismatch7. | Role schema confirmation. | | **3** | **Memory Retrieval** | Pulls related historical records from the graph13. | User query, vector coordinate. | Matched graph database records13. | Search timeout, irrelevant matches14. | Vector score checks (![][image56]). | | **4** | **Entity Verification** | Maps ingested data to ontology definitions15. | Raw text payload12. | Validated entity nodes15. | Incorrect categorization6. | Ontology class verification18. | | **5** | **Claim Parsing** | Extracts factual statements from raw logs12. | Entity records13. | Extracted RDF-style claims12. | Hallucinated statements7. | Constraint check logic14. | | **6** | **Evidence Matching** | Links claims to their original data sources13. | Claim statements12. | Linked source records13. | Missing source records7. | Lineage path verification5. | | **7** | **Confidence Analysis**| Calculates confidence based on source reliability. | Evidence records13. | Real-value confidence score. | Overconfidence on poor data. | Bayesian threshold checks9. | | **8** | **Contradiction Test** | Checks claims against existing database facts14. | New claims, active knowledge graph. | Verification pass/fail status14. | Uncaught logic conflict14. | Direct assertion check14. | | **9** | **Route Determination**| Routes validated claims to domain modules15. | Validated claim records. | Dispatched task alerts. | Incorrect routing, timeouts. | Intent verification schemas. | | **10** | **Reasoning & Synthesis**| Generates recommendations and actions1. | Domain-specific context7.| Operational draft plans1. | Misaligned recommendations6.| Semantic evaluation metrics. | | **11** | **Human Oversight Gate**| Pauses actions for manager review when required5.| Draft action templates1. | Approved execution models5.| Gate bypasses, approval delays. | MFA signature validation5. | | **12** | **Action Execution** | Writes approved modifications back to POS1. | Approved action instructions1. | Execution logs and API responses. | Writeback failure, out-of-sync APIs. | Automated API return validation. | | **13** | **System Writeback** | Saves verified outcomes to long-term memory13.| Execution logs13. | Updated graph entities13.| Double-writes, graph blockages. | Transaction compliance checks13. | | **14** | **Audit Log Signing** | Cryptographically signs the transaction record13.| Updated state vectors13. | Signed database audit files5.| System logging failures5. | Cryptographic hash checks5. | | **15** | **Feedback Assessment**| Compares outcomes against performance goals. | Telemetry updates12.| Goal deviation metrics. | Erroneous metric matching. | Target outcome variance checks. | | **16** | **Loop Learning** | Refines system confidence profiles47. | Out-of-spec deviation logs12.| Updated confidence parameters. | Overfitting on temporary noise48.| K-fold cross-validation checks. |

## **Part 13: Minimum Viable Intelligence Infrastructure Roadmap**

HESTIA's development prioritizes a stable foundation, starting with a core ontology and memory architecture before layer-by-layer deployment49.

  PHASE 1 (Ontology Core) ──► PHASE 2 (Belief & Trust) ──► PHASE 3 (Synthesized Intel)  
             │                          │                           │  
             ▼                          ▼                           ▼  
  \- Neo4j Ontological Schema  \- Proof-of-provenance \- Automated alerts  
  \- Raw Ingestion Ledger     \- Confidence decay    \- Bottleneck detection  
  \- Volatile caching         \- Manager verification gates     \- Brand-drift flags  
             │                          │                           │  
             ▼                          ▼                           ▼  
  PHASE 4 (Domain Modules) ──► PHASE 5 (Proactive Loop)  ──► PHASE 6 (Multi-Venue Core)  
             │                          │                           │  
             ▼                          ▼                           ▼  
  \- Culinary / Beverage      \- Intent-prediction engine       \- Group-wide aggregation  
  \- SevenRooms CRM sync       \- Task planning systems          \- Stock routing logic  
  \- Staff training tracking   \- Direct API executions \- Regional optimization

### **Table 13: Phased Roadmap and Operational Milestones**

| Phase | Phase Focus | Components to Build | Deferred Components | Validation Criteria | Operational Value |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **1** | **Foundational Memory** | Neo4j semantic model14, append-only Postgres logs13, volatile Redis caching36, basic entity extraction15. | Advanced belief updates7, automatic API executions1. | Zero data loss on shift log ingestion; correct entity mappings12. | Establishes a verified, single source of truth for venue operations13. |
| **2** | **Evidence & Confidence** | Claim-evidence linking13, confidence decay functions, manual approval gates5, basic security. | AI-generated menu updates23. | Verified claim lineages; automatic alerts on conflicting shift reports14. | Prevents false alerts and keeps recommendations realistic6. |
| **3** | **Venue Synthesis** | Bottleneck modeling, drift alerts6, performance tracking2. | Automated staff scheduling. | Accurate identification of operational bottlenecks and menu drift6. | Flags systematic issues for managers before they impact service6. |
| **4** | **Domain Modules** | Culinary and bar inventory integration23, reservation CRM sync26. | Dynamic, real-time ticket rerouting. | POS menu costs update automatically from invoice prices23. | Connects floor plans, guest notes, and recipe costs in one model23. |
| **5** | **Proactive Loops** | Intent-prediction engine, automatic event planners31, live action routing1. | Automated employee termination. | High-accuracy private event planning; automated drafts31. | Automates administrative workflows, reducing manager paperwork3. |
| **6** | **Multi-Venue Core** | Multi-unit data aggregation37, cross-location transfer routing23. | Automated group-wide pricing. | Zero cross-tenant data leaks; accurate multi-unit reporting10. | Helps multi-venue operators manage suppliers and staff scale. |

## **Part 14: Failure Modes and Anti-Patterns**

A platform like HESTIA must be engineered to withstand data anomalies, user errors, and architectural breakdowns49.

### **Table 14: Failure Diagnosis and Mitigation Protocol**

| Failure Pattern | Primary Root Cause | Critical Warning Signs | Operational Impact | Prevention Strategy | Detection Method | Corrective Action |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Identity Drift** \[cite: 6\] | High-frequency adaptations to temporary staff inputs6. | Menus or styling options drifting from core guidelines6. | Dilution of core brand value; generic service24. | Entrench founder values with high default weights7. | Monitor cosine similarity variance (![][image57])24. | Roll back operational parameters to verified DNA13. |
| **Memory Contamination** | Inadequate multi-tenant isolation schemas36. | Tenant data visible in unrelated workspaces10. | High-risk cross-tenant data leaks10. | Apply application-level encryption with separate keys10. | Audit database queries for missing tenant IDs36. | Revoke compromised encryption keys and isolate the schema10. |
| **Stale Memory** | System failure to decay historical data. | Outdated guest preferences used during service14. | Awkward guest interactions26. | Implement dynamic confidence decay equations. | Track record ages and compare with confidence metrics. | Clear out-of-date records and prompt for updates7. |
| **Creepy Guest Profiling** | Excessive recording of personal conversations12. | Shift notes logging irrelevant personal details33. | Guest discomfort; privacy violations33. | Restrict text parsers to pre-approved CRM fields26. | Run automated scans for sensitive terms in reviews. | Purge unauthorized fields and retrain staff27. |
| **Incorrect Pricing** | Calculating contribution margins from static recipe costs23. | System suggesting price cuts on high-cost items21. | Profit margin erosion on popular dishes23. | Link ingredient invoices directly to active menu costs23. | Verify POS prices against current ingredient costs23. | Pause pricing suggestions and update recipe values23. |
| **Overconfident Logic** | Ingesting raw claims without validation12. | High-priority warnings generated from single logs14. | Erratic automated scheduling changes. | Require multiple confirming sources before updating claims12. | Track confidence distributions across suggestions. | Flag low-confidence actions and route to manager5. |
| **Ontology Bloat** | Creating custom object schemas for every minor event11. | Slower database performance; complex schemas. | High maintenance overhead; system slowdowns11. | Ground the database schema strictly in BFO structures16. | Track total class counts and edge relationships. | Consolidate custom properties into existing core classes11. |
| **System Override Bypass** | Automated actions executing without approvals1. | Menu price edits showing on POS without GM approval23. | Legal liabilities and loss of business control1. | Enforce hard code boundaries on writeback routines1. | Log unauthorized changes on writeback connections5. | Revert unauthorized POS updates and suspend system writes1. |

## **Part 15: Structural Architecture Blueprint and Programmatic Execution**

To translate these principles into a secure, production-grade deployment, HESTIA's baseline system is modeled as a unified, open-source AI operating system8. This design ensures complete data ownership, strict security controls, and high reliability in demanding environments8.

### **Technology Stack and Architecture**

                       \[Ingestion Sources: POS, Reservations, Sensors\]  
                                              │  
                                              ▼  
                             \[Data Ingestion and Buffer Layer\]  
                      \- FastAPI (Gateway) & Redis (Real-time stream broker)  
                                              │  
                        ┌─────────────────────┴─────────────────────┐  
                        ▼                                           ▼  
          \[State Management Layer\]                     \[Core Storage and Audit Ledger\]  
   \- Neo4j Property Graph (Ontology)             \- PostgreSQL \+ pgvector (Event Ledger)  
   \- Dynamic continuants/occurrents \[cite: 17\]   \- Immutable raw data, transaction history  
   \- Path traversal indexing                     \- Application-Level Encryption (ALE)  
                        ▲                                           ▲  
                        └─────────────────────┬─────────────────────┘  
                                              │  
                                              ▼  
                                 \[Execution Gateway and APIs\]  
                       \- Direct writeback to Toast, SevenRooms, and CRM \[cite: 1, 26\]  
                       \- Hard-locked, role-permissioned validation layers

### **Relational Schema (PostgreSQL): Core Event Ledger and Audit Log**

SQL  
\-- Core Extension Registrations  
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  
CREATE EXTENSION IF NOT EXISTS "vector";

\-- Tenant Spatial and Operational Scopes  
CREATE TABLE tenant\_environments (  
    tenant\_id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    corporate\_name VARCHAR(255) NOT NULL,  
    kms\_key\_arn VARCHAR(512) NOT NULL, \-- Application-Level Encryption Reference  
    created\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP  
);

CREATE TABLE venues (  
    venue\_id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    tenant\_id UUID NOT NULL REFERENCES tenant\_environments(tenant\_id) ON DELETE CASCADE,  
    venue\_name VARCHAR(255) NOT NULL,  
    spatial\_layout\_coordinates JSONB, \-- Floor zones, table locations  
    created\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP  
);

\-- Immutable Append-Only Ingestion Ledger (Occurrent Storage)  
CREATE TABLE raw\_event\_ledger (  
    event\_id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    tenant\_id UUID NOT NULL REFERENCES tenant\_environments(tenant\_id) ON DELETE CASCADE,  
    venue\_id UUID REFERENCES venues(venue\_id) ON DELETE SET NULL,  
    source\_identity VARCHAR(100) NOT NULL, \-- E.g., 'toast\_pos', 'sevenrooms\_crm', 'shift\_log'  
    payload\_ciphertext BYTEA NOT NULL, \-- Application-Level Encrypted Payload  
    payload\_hash CHAR(64) NOT NULL, \-- SHA-256 integrity check  
    ingestion\_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP NOT NULL  
);

\-- Vector Claim Store (pgvector for semantic and temporal retrieval)  
CREATE TABLE vector\_claim\_ledger (  
    claim\_id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    tenant\_id UUID NOT NULL REFERENCES tenant\_environments(tenant\_id) ON DELETE CASCADE,  
    source\_event\_id UUID REFERENCES raw\_event\_ledger(event\_id) ON DELETE SET NULL,  
    subject\_entity\_uri VARCHAR(512) NOT NULL,  
    predicate\_relationship VARCHAR(100) NOT NULL,  
    object\_entity\_uri VARCHAR(512) NOT NULL,  
    claim\_embedding vector(1536) NOT NULL, \-- Unified semantic index  
    entrenchment\_score NUMERIC(3, 2\) NOT NULL DEFAULT 0.50, \-- Epistemic priority  
    confidence\_score NUMERIC(3, 2\) NOT NULL DEFAULT 1.00,  
    is\_superseded BOOLEAN DEFAULT FALSE NOT NULL,  
    superseded\_by\_claim\_id UUID,  
    valid\_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP NOT NULL,  
    valid\_to TIMESTAMP WITH TIME ZONE  
);

CREATE INDEX idx\_claim\_embedding ON vector\_claim\_ledger USING hnsw (claim\_embedding cosine);  
CREATE INDEX idx\_tenant\_superseded ON vector\_claim\_ledger (tenant\_id, is\_superseded);

### **Ontological Mappings (BFO Alignment)**

To maintain consistent data structures across diverse venues, HESTIA's Neo4j property graph aligns directly with the Basic Formal Ontology (BFO) standards16.

┌────────────────────────────────────────────────────────────────────────────────────────┐  
│                              BFO CONTINUANTS (Persistent)                              │  
├─────────────────────┬──────────────────────────────────────────────────────────────────┤  
│ Independent         │ \- \[MaterialEntity\]: \`Venue\`, \`Table\`, \`Ingredient\`, \`PhysicalPOS\`│  
│ Continuants         │ \- \[ImmaterialEntity\]: \`DiningZone\`, \`KitchenStation\`, \`AirSpace\` │  
├─────────────────────┼──────────────────────────────────────────────────────────────────┤  
│ Dependent           │ \- \[Quality\]: \`RecipeCost\`, \`AllergenStatus\`, \`TableState\`        │  
│ Continuants         │ \- \[Disposition\]: \`SkillCertification\`, \`DietaryProfile\` (Kosher) │  
└─────────────────────┴──────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐  
│                               BFO OCCURRENTS (Dynamic)                                 │  
├─────────────────────┬──────────────────────────────────────────────────────────────────┤  
│ Temporal Events     │ \- \[Process\]: \`DinnerService\`, \`ShiftHandoff\`, \`AcademyExam\`      │  
│                     │ \- \[History\]: \`AssetHistory\`, \`VenueLifecycleHistory\`             │  
└─────────────────────┴──────────────────────────────────────────────────────────────────┘

#### **Graph Implementation: Defining Objects, Links, and Revisions**

HESTIA's long-term graph database represents entities (such as tables, menu items, and guests) as nodes, mapping their properties, access permissions, and historical updates11:

Cypher  
// 1\. Instantiating a physical continuant (Dining Table)  
CREATE (t:MaterialEntity:Table {  
    uri: "urn:hestia:tenant-A:venue-1:table:12",  
    uuid: "1a8f3b6c-5e4d-4c3b-2a1f-0e9d8c7b6a5f",  
    tenant\_id: "tenant-A",  
    venue\_id: "venue-1",  
    label: "Table 12",  
    capacity: 4,  
    x\_coordinate: 14.50,  
    y\_coordinate: 22.10,  
    security\_marking: "FOH\_GENERAL"  
})  
RETURN t;

// 2\. Instantiating a menu ingredient with dietary constraints  
CREATE (i:MaterialEntity:Ingredient {  
    uri: "urn:hestia:tenant-A:venue-1:ingredient:butter",  
    uuid: "9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c",  
    tenant\_id: "tenant-A",  
    name: "Unsalted Butter",  
    allergen\_lactose: true,  
    is\_kosher\_certified: true  
})  
RETURN i;

// 3\. Mapping a dynamic service process (Occurrent) linking Table and Staff  
CREATE (p:Process:ServiceEvent {  
    uri: "urn:hestia:tenant-A:venue-1:process:shift-1002-table-12",  
    uuid: "7e6d5c4b-3a2f-1e0d-9c8b-7a6f5e4d3c2b",  
    tenant\_id: "tenant-A",  
    service\_type: "DinnerService",  
    seating\_timestamp: datetime("2026-10-24T18:30:00Z"),  
    end\_timestamp: datetime("2026-10-24T20:15:00Z")  
});

// 4\. Declaring relationships (Links) and temporal connections  
MATCH (t:Table {uri: "urn:hestia:tenant-A:venue-1:table:12"})  
MATCH (p:ServiceEvent {uri: "urn:hestia:tenant-A:venue-1:process:shift-1002-table-12"})  
CREATE (p)-\[:OCCURS\_AT\]-\>(t);

#### **Graph-Based AGM Belief Revision: Supersedes Chain Implementation**

When operational parameters change (e.g., a recipe cost update), HESTIA does not overwrite existing data7. It creates a new revision node and updates the system pointers, preserving the historical timeline12:

Cypher  
// 1\. Retrieve the existing active recipe quality node  
MATCH (m:MenuItem {uri: "urn:hestia:tenant-A:venue-1:menu-item:carbonara"})-\[rel:HAS\_QUALITY {status: "ACTIVE"}\]-\>(q\_old:Quality:RecipeCost)  
SET rel.status \= "SUPERSEDED", rel.valid\_to \= datetime()

// 2\. Create the new cost revision node  
CREATE (q\_new:Quality:RecipeCost {  
    uri: "urn:hestia:tenant-A:venue-1:recipe-cost:carbonara:v2",  
    uuid: "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",  
    tenant\_id: "tenant-A",  
    cost\_value: 3.45,  
    currency: "USD",  
    valid\_from: datetime()  
})

// 3\. Link the new quality node as active, establishing the history chain  
CREATE (m)-\[:HAS\_QUALITY {status: "ACTIVE"}\]-\>(q\_new)  
CREATE (q\_new)-\[:SUPERSEDES\]-\>(q\_old);

### **Python Programmatic Implementation: The Reconcile and Belief Revision Routine**

To handle incoming observations, HESTIA's processing module parses data, verifies permissions, checks for logical contradictions, and updates the graph database13:

Python  
import hmac  
import hashlib  
import json  
from datetime import datetime, timezone  
import uuid  
from typing import Dict, Any, Optional  
from neo4j import GraphDatabase  
from pgvector.psycopg2 import register\_vector  
import psycopg2

class HestiaEpistemicController:  
    """  
    Epistemic reasoning engine for HESTIA.  
    Handles data isolation, application encryption, and graph belief updates.  
    """  
    def \_\_init\_\_(self, db\_conn\_string: str, neo4j\_uri: str, neo4j\_auth: tuple, kms\_client):  
        self.pg\_conn \= psycopg2.connect(db\_conn\_string)  
        self.neo4j\_driver \= GraphDatabase.driver(neo4j\_uri, auth=neo4j\_auth)  
        self.kms \= kms\_client  \# Mock or AWS KMS Client interface

    def \_decrypt\_payload(self, ciphertext: bytes, tenant\_id: str) \-\> Dict\[str, Any\]:  
        """Decrypts tenant data using ALE envelope keys."""  
        \# 1\. Fetch encrypted KEK from key store, decrypt via KMS, decapsulate DEK  
        \# 2\. Decrypt raw bytes with AesGcm authentication check  
        decrypted\_json\_string \= self.kms.decrypt(ciphertext, tenant\_id)  
        return json.loads(decrypted\_json\_string)

    def process\_new\_observation(self, raw\_event\_id: str, tenant\_id: str) \-\> Dict\[str, Any\]:  
        """  
        Executes Step 5 to Step 8 of the Intelligence Loop.  
        Extracts claims, validates context, and updates the graph model.  
        """  
        \# 1\. Read encrypted entry from the PostgreSQL ledger  
        cursor \= self.pg\_conn.cursor()  
        cursor.execute(  
            "SELECT payload\_ciphertext, source\_identity FROM raw\_event\_ledger WHERE event\_id \= %s AND tenant\_id \= %s;",  
            (raw\_event\_id, tenant\_id)  
        )  
        row \= cursor.fetchone()  
        if not row:  
            raise ValueError(f"Event ID {raw\_event\_id} under Tenant {tenant\_id} not found.")

        ciphertext, source \= row  
        payload \= self.\_decrypt\_payload(ciphertext, tenant\_id)  
          
        \# 2\. Standardize entity classifications  
        subject\_uri \= f"urn:hestia:{tenant\_id}:{payload\['subject'\]}"  
        predicate \= payload\['relationship'\]  
        object\_uri \= f"urn:hestia:{tenant\_id}:{payload\['object'\]}"  
        new\_val \= payload\['value'\]

        \# 3\. Check for active contradictions in the Neo4j graph database  
        with self.neo4j\_driver.session() as session:  
            conflict \= session.execute\_read(  
                self.\_check\_for\_contradictions, tenant\_id, subject\_uri, predicate, object\_uri, new\_val  
            )

            if conflict:  
                \# Resolve using the entrenchment hierarchy \[cite: 7, 14, 20\]  
                if conflict\['existing\_entrenchment'\] \>= payload.get('entrenchment', 0.50):  
                    \# Flag a contradiction alert and suspend write operations  
                    self.\_log\_contradiction\_incident(raw\_event\_id, tenant\_id, conflict, payload)  
                    return {"status": "CONFLICT\_DETECTED", "action": "MANUAL\_OVERSIGHT\_REQUIRED"}  
                else:  
                    \# Deprecate the old claim and queue the update  
                    session.execute\_write(  
                        self.\_apply\_belief\_revision, tenant\_id, subject\_uri, predicate, object\_uri, new\_val, payload.get('entrenchment', 0.50)  
                    )  
            else:  
                \# No conflict; write the verified claim directly \[cite: 14, 44\]  
                session.execute\_write(  
                    self.\_write\_new\_claim, tenant\_id, subject\_uri, predicate, object\_uri, new\_val, payload.get('entrenchment', 0.50)  
                )

        return {"status": "SUCCESSFULLY\_SYNCHRONIZED", "action": "BELIEF\_UPDATED"}

    @staticmethod  
    def \_check\_for\_contradictions(tx, tenant\_id: str, sub: str, pred: str, obj: str, val: Any) \-\> Optional\[Dict\[str, Any\]\]:  
        """Queries the graph database to detect logical conflicts."""  
        query \= """  
        MATCH (s {uri: $sub})-\[r:HAS\_PROPERTY {status: 'ACTIVE'}\]-\>(p {predicate: $pred})  
        WHERE s.tenant\_id \= $tenant\_id AND p.value \<\> $val  
        RETURN p.uri AS existing\_uri, p.value AS existing\_value, p.entrenchment\_score AS existing\_entrenchment;  
        """  
        result \= tx.run(query, sub=sub, pred=pred, val=val, tenant\_id=tenant\_id)  
        record \= result.single()  
        return dict(record) if record else None

    @staticmethod  
    def \_apply\_belief\_revision(tx, tenant\_id: str, sub: str, pred: str, obj: str, val: Any, entrenchment: float):  
        """Applies AGM belief revision to the graph, updating pointer configurations."""  
        query \= """  
        MATCH (s {uri: $sub})-\[rel:HAS\_PROPERTY {status: 'ACTIVE'}\]-\>(p\_old {predicate: $pred})  
        SET rel.status \= 'SUPERSEDED', rel.valid\_to \= datetime()  
        WITH s, p\_old  
        CREATE (p\_new:Quality:Property {  
            uri: $obj,  
            uuid: apoc.create.uuid(),  
            tenant\_id: $tenant\_id,  
            predicate: $pred,  
            value: $val,  
            entrenchment\_score: $entrenchment,  
            valid\_from: datetime()  
        })  
        CREATE (s)-\[:HAS\_PROPERTY {status: 'ACTIVE', valid\_from: datetime()}\]-\>(p\_new)  
        CREATE (p\_new)-\[:SUPERSEDES\]-\>(p\_old);  
        """  
        tx.run(query, sub=sub, pred=pred, obj=obj, val=val, entrenchment=entrenchment, tenant\_id=tenant\_id)

    @staticmethod  
    def \_write\_new\_claim(tx, tenant\_id: str, sub: str, pred: str, obj: str, val: Any, entrenchment: float):  
        """Saves a new verified claim directly to the graph."""  
        query \= """  
        MERGE (s {uri: $sub, tenant\_id: $tenant\_id})  
        ON CREATE SET s.uuid \= apoc.create.uuid()  
        CREATE (p\_new:Quality:Property {  
            uri: $obj,  
            uuid: apoc.create.uuid(),  
            tenant\_id: $tenant\_id,  
            predicate: $pred,  
            value: $val,  
            entrenchment\_score: $entrenchment,  
            valid\_from: datetime()  
        })  
        CREATE (s)-\[:HAS\_PROPERTY {status: 'ACTIVE', valid\_from: datetime()}\]-\>(p\_new);  
        """  
        tx.run(query, sub=sub, pred=pred, obj=obj, val=val, entrenchment=entrenchment, tenant\_id=tenant\_id)

    def \_log\_contradiction\_incident(self, raw\_event\_id: str, tenant\_id: str, conflict: Dict\[str, Any\], payload: Dict\[str, Any\]):  
        """Logs logical contradictions to the database for manager review."""  
        cursor \= self.pg\_conn.cursor()  
        cursor.execute(  
            """  
            INSERT INTO raw\_event\_ledger (tenant\_id, source\_identity, payload\_ciphertext, payload\_hash)  
            VALUES (%s, %s, %s, %s);  
            """,  
            (  
                tenant\_id,  
                "HESTIA\_CORE\_REASONER",  
                psycopg2.Binary(json.dumps({  
                    "incident\_class": "EPISTEMIC\_CONTRADICTION",  
                    "source\_event\_id": raw\_event\_id,  
                    "existing\_fact\_uri": conflict\['existing\_uri'\],  
                    "existing\_value": conflict\['existing\_value'\],  
                    "conflicting\_payload": payload  
                }).encode('utf-8')),  
                hashlib.sha256(json.dumps(payload).encode('utf-8')).hexdigest()  
            )  
        )  
        self.pg\_conn.commit()

## **Part 16: Comprehensive Production Readiness Checklist**

Before moving HESTIA to a live production environment, technical teams must audit and verify several key operational areas:

* **Cryptographic Keys (KMS)**: Verify that HSM-backed Key Encryption Keys (KEKs) are isolated on a per-tenant basis in Amazon KMS or HashiCorp Vault10. Confirm that automated annual key rotation policies are active.  
* **Row-Level Security (RLS)**: Run automated tests to verify that PostgreSQL row-level security policies block queries attempting to pull data without a validated tenant session context10.  
* **Neo4j Cypher Auditing**: Ensure that Cypher transactions run with forced constraint verification, preventing the creation of orphan properties or unmapped object relationships14.  
* **Vector Store Isolation**: Verify that HNSW vector search index queries restrict searches to the namespace identifier linked to the active tenant JWT10.  
* **Dynamic Confidence Decay**: Run simulations over a rolling 90-day window to verify that unconfirmed observations decay in confidence automatically, preventing stale information from polluting recommendations12.  
* **Manual Override Gates**: Audit writing paths to verify that high-risk actions (such as POS menu price updates or database revisions) halt and trigger manual manager approvals1.  
* **Epistemic Constraint Limits**: Verify that contradiction isolation routines identify logical conflicts, block automated executions, and flag issues for review without causing thread locks or service delays1.  
* **Regulatory Conformity**: Audit storage logs to ensure the system is fully compliant with ISO 27001 data-retention rules and GDPR user deletion requirements2.

This checklist ensures HESTIA provides a secure, high-integrity foundation for enterprise operations1.

## **Part 17: Synthesis and Architectural Action Blueprint**

For an artificial intelligence hospitality technology company designing the foundational intelligence infrastructure for a long-term Venue Intelligence Operating System, this blueprint recommends prioritizing system-wide data integrity and security1. Standalone LLMs or basic RAG pipelines are highly susceptible to hallucinations and cannot trace how beliefs evolve over time6.  
HESTIA must build on **four structural pillars**:

1. **Grounded Top-Level Ontology**: Align the data model with Basic Formal Ontology standards to represent physical spaces, menus, and roles as stable continuants, while logging daily shifts and incidents as dynamic occurrents16.  
2. **Epistemic Belief Revision (AGM Postulates)**: Treat incoming data streams as proposed observations rather than immediate updates12. Store verified claims in dynamic, version-controlled dependency chains to maintain a clear operational history without overwriting old records7.  
3. **Zero-Trust Cryptographic Isolation**: Secure multi-tenant configurations using dedicated database schemas, separate vector namespaces, and Application-Level Encryption with individual tenant keys managed in a central cloud KMS10.  
4. **Governed Intelligence Loop**: Enforce manual review boundaries for high-risk decisions (such as POS menu pricing or personal staff records)1. This keeps AI recommendations aligned with human oversight and operational reality1.

By deploying this architecture in phased milestones49, operators can turn fragmented restaurant, hotel, and bar metrics into a secure, high-performance operational intelligence engine1.

#### **עבודות שצוטטו**

1. Connecting Agents to Decisions \- Palantir Blog, [https://blog.palantir.com/connecting-agents-to-decisions-277dee8ddb40](https://blog.palantir.com/connecting-agents-to-decisions-277dee8ddb40)  
2. Enterprise Legal AI Case Study: Scaling with Legal Ontology \- HAQQ, [https://haqq.ai/case-study/legal-ontology](https://haqq.ai/case-study/legal-ontology)  
3. AgentOS, The Operating System for AI Agents \- Enhans, [https://www.enhans.ai/agent-os](https://www.enhans.ai/agent-os)  
4. Architecture layers | Palantir-Dell Sovereign AI Operating System Reference Architecture, [https://infohub.delltechnologies.com/en-ca/l/palantir-dell-sovereign-ai-operating-system-reference-architecture/architecture-layers/3/](https://infohub.delltechnologies.com/en-ca/l/palantir-dell-sovereign-ai-operating-system-reference-architecture/architecture-layers/3/)  
5. Platform Governance on Palantir: A Guide to Secure Enterprise AI Scaling \- Ethicrithm, [https://ethicrithm.com/platform-governance-on-palantir-a-guide-to-secure-enterprise-ai-scaling/](https://ethicrithm.com/platform-governance-on-palantir-a-guide-to-secure-enterprise-ai-scaling/)  
6. AI IDENTITY DRIFT \- Phase 5, [https://www.phase-5.com/hubfs/Phase5\_AIidentity\_whtppr\_2025.pdf](https://www.phase-5.com/hubfs/Phase5_AIidentity_whtppr_2025.pdf)  
7. Every Tool Solving the AI Memory Problem Is Solving a Different Problem \- XTrace, [https://xtrace.ai/blog/every-tool-is-solving-a-different-memory-problem](https://xtrace.ai/blog/every-tool-is-solving-a-different-memory-problem)  
8. Overview | NaasAI Platform Docs, [https://docs.naas.ai/architecture/what-is-abi/](https://docs.naas.ai/architecture/what-is-abi/)  
9. BELIEF ENGINE: BAYESIAN MEMORY FOR CONFIG- URABLE OPINION DYNAMICS IN LLM AGENTS \- OpenReview, [https://openreview.net/pdf/a37508bb551b24339d57ad79adbebeebe6840269.pdf](https://openreview.net/pdf/a37508bb551b24339d57ad79adbebeebe6840269.pdf)  
10. Multi-tenant isolation for AI agents: security guide | Blaxel Blog, [https://blaxel.ai/blog/multi-tenant-isolation-ai-agents](https://blaxel.ai/blog/multi-tenant-isolation-ai-agents)  
11. What is Ontology? \- Palantir Developer Community, [https://community.palantir.com/t/what-is-ontology/6703](https://community.palantir.com/t/what-is-ontology/6703)  
12. A Dual-Process Cognitive Memory System for Self-Evolving LLM Agents \- arXiv, [https://arxiv.org/html/2606.09483v1](https://arxiv.org/html/2606.09483v1)  
13. Graph-Native Cognitive Memory for AI Agents: Formal Belief Revision Semantics for Versioned Memory Architectures \- arXiv, [https://arxiv.org/html/2603.17244v1](https://arxiv.org/html/2603.17244v1)  
14. Why Agent Memory Needs a Graph: Lessons from the Kumiho Architecture | Ranjan Kumar, [https://ranjankumar.in/why-agent-memory-needs-a-graph-lessons-from-the-kumiho-architecture](https://ranjankumar.in/why-agent-memory-needs-a-graph-lessons-from-the-kumiho-architecture)  
15. Palantir Ontology: Architecture & Benefits \- PuppyGraph, [https://www.puppygraph.com/blog/palantir-ontology](https://www.puppygraph.com/blog/palantir-ontology)  
16. a computational ontological model for machine-understandable data in artificial intelligence, [https://open.metu.edu.tr/bitstream/handle/11511/99765/DilekYarganDissertation.pdf](https://open.metu.edu.tr/bitstream/handle/11511/99765/DilekYarganDissertation.pdf)  
17. BFO: Basic Formal Ontology1 | Request PDF \- ResearchGate, [https://www.researchgate.net/publication/363109066\_BFO\_Basic\_Formal\_Ontology1](https://www.researchgate.net/publication/363109066_BFO_Basic_Formal_Ontology1)  
18. GitHub \- BFO-ontology/BFO: BFO repository including source code and latest documents, [https://github.com/bfo-ontology/bfo](https://github.com/bfo-ontology/bfo)  
19. History in the Basic Formal Ontology \- CEUR-WS.org, [https://ceur-ws.org/Vol-4194/paper1.pdf](https://ceur-ws.org/Vol-4194/paper1.pdf)  
20. (PDF) Belief Revision: an introduction \- ResearchGate, [https://www.researchgate.net/publication/260134902\_Belief\_Revision\_an\_introduction](https://www.researchgate.net/publication/260134902_Belief_Revision_an_introduction)  
21. Menu Engineering Guide: Stars, Plowhorses, Puzzles & Dogs Explained \- MenuSpy, [https://menuspy.ai/guides/menu-engineering-guide/](https://menuspy.ai/guides/menu-engineering-guide/)  
22. How to use menu engineering and design to craft a profitable menu | Baker Tilly, [https://www.bakertilly.com/insights/menu-engineering](https://www.bakertilly.com/insights/menu-engineering)  
23. Menu Engineering: How to Build a More Profitable Restaurant Menu \- Supy, [https://supy.io/blog/learn-menu-engineering](https://supy.io/blog/learn-menu-engineering)  
24. AI Brand Drift: The Hidden Risk Undermining Automated Marketing \- Trade Press Services, [https://www.tradepressservices.com/ai-brand-drift-the-hidden-risk-undermining-automated-marketing/](https://www.tradepressservices.com/ai-brand-drift-the-hidden-risk-undermining-automated-marketing/)  
25. Main Page | The Ontology Research & Development Network, [https://ncor-network.org/wiki/main-page](https://ncor-network.org/wiki/main-page)  
26. OpenTable Alternatives: Top Competitors 2026 \- CheckThat.ai, [https://checkthat.ai/brands/opentable/alternatives](https://checkthat.ai/brands/opentable/alternatives)  
27. Burn-After-Use for Preventing Data Leakage through a Secure Multi-Tenant Architecture in Enterprise LLM \- arXiv, [https://arxiv.org/pdf/2601.06627](https://arxiv.org/pdf/2601.06627)  
28. Food Process Ontology Requirements \- Semantic Web Journal, [https://www.semantic-web-journal.net/system/files/swj2972.pdf](https://www.semantic-web-journal.net/system/files/swj2972.pdf)  
29. Read the Docs, [https://ontolearner.readthedocs.io/](https://ontolearner.readthedocs.io/)  
30. An Introduction to Ontology Engineering \- KR 2016, [https://people.cs.uct.ac.za/\~mkeet/files/OEbook.pdf](https://people.cs.uct.ac.za/~mkeet/files/OEbook.pdf)  
31. Best AI Sales Assistant for Restaurants (Private Events) 2026 | Mikla.ai, [https://mikla.ai/blog/best-ai-sales-assistant-for-restaurants-private-events-in-2026](https://mikla.ai/blog/best-ai-sales-assistant-for-restaurants-private-events-in-2026)  
32. What is Growth Strategy and Future Prospects of SevenRooms Company?, [https://businessmodelcanvastemplate.com/blogs/growth-strategy/sevenrooms-growth-strategy](https://businessmodelcanvastemplate.com/blogs/growth-strategy/sevenrooms-growth-strategy)  
33. How to Build a Restaurant Email List the Right Way \- SevenRooms, [https://sevenrooms.com/blog/how-to-build-a-restaurant-email-list/](https://sevenrooms.com/blog/how-to-build-a-restaurant-email-list/)  
34. Supporting the recruitment of software development experts: aligning technical knowledge to an industry domain, [https://sol.sbc.org.br/index.php/sbsc/article/download/24230/24056/](https://sol.sbc.org.br/index.php/sbsc/article/download/24230/24056/)  
35. Architecting Secure Multi-Tenant Data Isolation | by Justin Hamade | Medium, [https://medium.com/@justhamade/architecting-secure-multi-tenant-data-isolation-d8f36cb0d25e](https://medium.com/@justhamade/architecting-secure-multi-tenant-data-isolation-d8f36cb0d25e)  
36. Data isolation in multi-tenant SaaS \- Redis, [https://redis.io/blog/data-isolation-multi-tenant-saas/](https://redis.io/blog/data-isolation-multi-tenant-saas/)  
37. Multi-Tenancy in Vector Databases | Pinecone, [https://www.pinecone.io/learn/series/vector-databases-in-production-for-busy-engineers/vector-database-multi-tenancy/](https://www.pinecone.io/learn/series/vector-databases-in-production-for-busy-engineers/vector-database-multi-tenancy/)  
38. Ontological reusability in state-of-the-art semantic languages, [http://www.ibspan.waw.pl/\~gawinec/publications/Szczyrk\_2006.pdf](http://www.ibspan.waw.pl/~gawinec/publications/Szczyrk_2006.pdf)  
39. MARC: Multimodal and Multi-Task Agentic Retrieval-Augmented Generation for Cold-Start Recommender System \- arXiv, [https://arxiv.org/html/2511.08181v2](https://arxiv.org/html/2511.08181v2)  
40. Vector Database Multi-Tenancy \- Meegle, [https://www.meegle.com/en\_us/topics/vector-databases/vector-database-multi-tenancy](https://www.meegle.com/en_us/topics/vector-databases/vector-database-multi-tenancy)  
41. Table Reservation Platform Market Research Report 2034, [https://marketintelo.com/report/table-reservation-platform-market](https://marketintelo.com/report/table-reservation-platform-market)  
42. Menu Engineering for Restaurant Profitability \- Black Pearl Investments, [https://www.blackpearl-investments.com/insights/menu-engineering-for-profitability](https://www.blackpearl-investments.com/insights/menu-engineering-for-profitability)  
43. MENU ENGINEERING EXERCISE \- NAU, [https://jan.ucc.nau.edu/\~grc3/ha270/class/restaurant/menu/menueng.htm](https://jan.ucc.nau.edu/~grc3/ha270/class/restaurant/menu/menueng.htm)  
44. A non-linear dynamical approach to belief revision in cognitive behavioral therapy \- PMC, [https://pmc.ncbi.nlm.nih.gov/articles/PMC4030160/](https://pmc.ncbi.nlm.nih.gov/articles/PMC4030160/)  
45. Persistent cognitive graph memory for AI agents — facts, decisions, reasoning chains, corrections. 16 query types, sub-millisecond. Rust core \+ Python SDK \+ MCP server. · GitHub, [https://github.com/agentralabs/agentic-memory](https://github.com/agentralabs/agentic-memory)  
46. Menu Engineering for Hotels: Data-Driven Strategy to Maximize Restaurant Profitability | Reeco Blog, [https://reeco.com/blogs/menu-engineering-guide](https://reeco.com/blogs/menu-engineering-guide)  
47. Kingdee Launches Enterprise AI Operating System "Lingee", [https://www.kingdee.com/global/2026/05/20/kingdee-launches-enterprise-ai-operating-system-lingee/](https://www.kingdee.com/global/2026/05/20/kingdee-launches-enterprise-ai-operating-system-lingee/)  
48. All You Need to Know about Drift in AI-generated Video \- Kling AI, [https://kling.ai/blog/fix-ai-video-drift-consistency-guide](https://kling.ai/blog/fix-ai-video-drift-consistency-guide)  
49. The Palantirization of everything | Andreessen Horowitz, [https://a16z.com/the-palantirization-of-everything/](https://a16z.com/the-palantirization-of-everything/)  
50. Dell and Palantir Introduce an On-Premises AI Operating System, [https://www.dell.com/en-us/blog/dell-and-palantir-introduce-an-on-premises-ai-operating-system/](https://www.dell.com/en-us/blog/dell-and-palantir-introduce-an-on-premises-ai-operating-system/)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAVCAYAAABLy77vAAAAS0lEQVR4XmNgGAWjgCQQjC5ALviPLkAuuIguQAmgmqtAAGQYH7LAVzLxHwaIYWIMFIBmIN6GLkgqYAPia+iC5ACqBfQtdIFRQBwAADyTF5V5Sko2AAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAVCAYAAAAZ6IOkAAAB70lEQVR4Xu2XvyuGURTHT0SESSZWixQlBtn8A8pgMjOaDKQkk1GRwcAkGxmUQhZZJGYWvyalWP26533u8zrveb/3cd4bPaX3U6fu/Zxz732e09vTfYmqVKkiGNPin3Lk41MnEFMudlx06oSBFRcLWkaypIWBdhe7LkZ1QvBjE7igy483/dzCJJXW8nhfzK0MudimZL317BSuv/LjJj+v/U4XydxXbiLdsXIIrqsBrlImXDS4eKLK1vM6Xc+/JO0Y5IpwslW5M++zWCVcw+5WSyOVNoFrUb3VFRgmnFwj7CVZD4C8hZgm3GlJidffluC+G4ST/JFDXhJ62ZC3ENOEcy0p8Q/AQQ4JJ2cp8Y06IQi9bMhbiGnCqZaEn0HPixwQTqZNqNMJATqICXkLuTRhmXBykbCXoIOYkLcQ04QLLSnxN8BBeggntwh7SehlQ95CTBNetKTEzwAXhJODyj17n8U04Rp2J1oaiWkCqre6Iu8+JLxgDji9Ec97xbzeO8m4dx/KI7KawOdw7l64Ae8k18AxyJXABXuUXDffXDyWpgugJnR4x9febj/mu4ekxXu9VpLmdfSLmvRKvC4cc+l9s4t5P0aEfBl9WhjhB2zTUmF+iEjS/z4h/vp8E7FX6d8i9ya8apEDuTdhRIscKGvCF+rjun5tfzpzAAAAAElFTkSuQmCC>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAVCAYAAABLy77vAAAAyElEQVR4Xu2RsQlCMRRFU9jY2DiAooggdmIlaGkhWLiEK7iAOIAjOIRDOIPgDDYWFvpuyP/GY6LY/wMXkvNeLh++cxX/Urc0KCNmlqNlwYHoWLaWR0jrfVyi2dwyCmelGS9sLONwzhXJk6IsybciPjoHN4X35Iru7rPoENwK3pMrSpH6yhIN2pQZtHuhLNCwS5lAe1fKGC30KMHNcqIkKupTRqhgD7fE3aOiAWVgZ1nD6V6D86hoSGlM3OsvMSUcpJboUzsVP3gCzOo9arn0rLoAAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAVCAYAAACUhcTwAAAAb0lEQVR4XmNgGLzgP7oANgBShAuXgxSwQTmngXgXEG8F4s1QDLehAsZAAyhO0EXmQMEJIJZHF0QGXED8G10QHRD0qTYDEYpg3sYLQApuoguiA5CiNeiCyCCUAaJoOroEMohlgCjqRJdAB3roAgMAAElEHUzb+YLQAAAAAElFTkSuQmCC>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAZCAYAAAAIcL+IAAAAgklEQVR4XmNgGKZAC4j/A/EqIP4LZYugqIACkIQoGh+EUQAXFoljUH44khgYzAdiDiQ+ukacAKToM7ogDAQD8U8GiKJcNDmcAKR4FrogNnCIAaKYCV0CG8Dw0HWoABuyIFQMRSFMwAdJTA5JHA7igfg+sgADFkUwkMiAkMSpaBRgBQDpVCecRo5/WwAAAABJRU5ErkJggg==>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAVCAYAAADID4fUAAABa0lEQVR4Xu2UwSpFURSGl0QpMTExQpKSmeQBvIKMlDv1CgZmPABeQGTgFZiICUVkIAOFVzAl1jp7r3P++5+9zzFQSverv7PWv9feZ+2797kiPf4xX6qD+Mwxq3pg0xlSjbAZWWJDOabcXrwR4/GYH1XDBU/Rr7EtYcA0QWOOj6MGuyrqi3u+rjpRranupD6vYDE+f9oE787JNeEMSMMxOE1NvLKRgF/alif5jSbGIL+F+FEyx8C0NXEp1ZGsdA8XTEm1W9y1Xfh7yBuxiZNsRvintPyUPGeZcp67KeEzTWLF02xmuJL64imeJVxIx+b0qeZV5+CXWMEMmxm2JNRnd6QMq24gP1R9QP4JcUluUb8HyE70OuQjPMdyu1fOHsQlVjTHpqSbOEt4yJuqnzyrx3vUgbjEiuysmHc2JN2YM6q6YFNCvf1tO9cQlwuyEMv3Vasx5nEkN4afsJGra2WBDeKFDWJX2jfR42/5BvEoaRkJQM84AAAAAElFTkSuQmCC>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAVCAYAAACt4nWrAAAApElEQVR4XmNgGAVDDZijCwDBMnQBcsF/LJgNRQUWAFJEDEA2dAmaHE5ArOEP0QWIAYPG8CMMiKAJQZXGDog1HF0diL8bTQwDoGsiFpxkQNP7FQsGKUAXg2F8oI4BolcdXQIZEONyWDgjgzaoWAKaOApA14QNYDN8DxYxDEBQARB8RhdgwG4hBiCoAApA6qYAcRiUTZQ+ohQhAWN0AXzABV1gZAEA6UQ6xJrUEpsAAAAASUVORK5CYII=>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAVCAYAAACUhcTwAAAAgElEQVR4XmNgGLygDV0ACGLQBf5jwRtQVCBJgPAnIGZBlYYAkCRBQLQifSgNwsdRpSEAJKGOxD8PFSMIQIrS0QXRAcxqMNgG5TDDpSEARdFnKIcTLg0BILFLMI4kEE9AyIHBEgYsDj8JxB+B2BOIrzBAFHCgqEACOkDMii5IZwAAXR8kpyWo9GIAAAAASUVORK5CYII=>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAVCAYAAAAnzezqAAABWElEQVR4Xu2UwSpFURSGFyI3ipIMjG4xMVJm3kHewciAMlNXJpJnMDARpZQopSRhxMjAK5CpiSGxVnvt/Ps/u3P20OB8tWr/31pn333OveeKtLQENrQutGa5UcCW1jFLZ0Wrn9y41hSKH605Xx96LmFb0llbr0E2Ht1zJbxQtoE7csyohDm+O978wV2spbQdmKD8JNWNmOydSHCbkG9gXcy+5DdH6g6A/hrWxexIfnOEPyjC/oq81cBfO4/9qm2www3gVsoOcK71DnlQQn8IXIV4ABuuw2bsTYh8ussdDGmc2ZWGAQAfbby7pmsbZ06kYaAGu+6I8jPk6JL9FzEoH1J2AJvpQp50F+nz/ArOqBzgG4OEJn638+7ewMXHvQfO8hnk6Bhz6ywuJbweX5L+ao0RCTMH5M3ZX/eyr++TbmBMQm9Vq+fr02QCWGBRyAyLDMNa0yxb/gW/S59rVJtfnb8AAAAASUVORK5CYII=>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAVCAYAAABLy77vAAAAyklEQVR4Xu2PQQ4BQRBFf2IlxAUsCBGJ2HIRh3AFsbKxcRuXsBNhbVbiAi5AVVfPaH+6J8FOvOQnPe9nqruAP+9Sl7RYBrQlW8mMC6UnWUvuPp3XukC7kz83/HftWQMLycSfU4PmsC5kE3EFqUH5a5mYc1QNurCEeX1ZiapBe5Ywf2WpaNFlCfM7lkiv7GSfJT4cNGAJ8weWMJ+xVLQYsoT5G0uYX7JUtBixRHqFmHNoMWYpTFH+6cwuvy2WkKN3TcnKn78itvov8wAhxD8J5gVc0wAAAABJRU5ErkJggg==>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAVCAYAAAAnzezqAAABNUlEQVR4Xu2UQSsFYRSGT0RJ2chOUZKSomQjO3/G0spGNrr+gCILC1a2ykIpyc7aT5Bs/QHie2fOl3feOcNMLCzmqbd7znO+mXsW97tmPT1fjKVMqGzBUcq+SmE75TJlXgfgIOXDMyOz79iy8pkM6mvqM/CLXp97X2HNP7sugPNDgdP+MXB34gq6LHBs9S8DcE/ST1IPHtzX6LIAzkYvYb9JNXNisf/zBc6oZvCDjXwhZ1U20GaBW6qZXSs9bl0FyDmVDbRZ4IZqJi8wogPI8J4GtFngkGpmYLEv5ILKBtossEw1c2GxL2T+w/iJHYtfAncv/Tr14NV9DcgllYkVK2fP4uEwy4y6Y949DM7sqYiSGff+lByYdr9h5eKocfcV+KuU4ZS3lJfq+PdgwSmVAasqev4Fn4knaQ76g8psAAAAAElFTkSuQmCC>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAVCAYAAACUhcTwAAAAM0lEQVR4XmNgGBqgC10ABmyAeCUQ/4dirCAdiDmA+A0DHkUwMKqICopg0YGOTZEVDSYAAIBaHTrGq7LkAAAAAElFTkSuQmCC>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAVCAYAAAAnzezqAAABUklEQVR4Xu2UPy8EURTFD0L8KUgUCoVKQ4hE5zsolRqVRqIjRCMan4BCo5KIhERIUIiKRKLQqYnWB0C4N/cOb868t/N0ivklJzv3nLNv7+7OLtDQYCyLTkSjHLTgi40IC6J28gZEQ6GhB4359b7POWgvpRXv3EayyvmPNGvhmjymC9a7F12KzkSnrvAFbnwuNBtkPwzSfIfIlsQqGw4/74rmLHZRPYiZYAO2+Ah5FzRnsYn6BZhe0Tubwrk/hl9Dx28cZx1W7OGgBamFj0WvwdwJ6+o9lKRYQMs5jCO9QIzik0iyhZoCUXsgUds/QE2B0O4Tm45mDxGvdP5MOAhv+PsCR2wKbbDsmfzKAp/hAAs3gnnKvZfAK5iDZTscOLE3ot4SG/oPpj+PD5TvWqUP1tkjX5mHZdscOP2wfFG05teHpUbANBuZTLIRoVs0zGbDv+AbukBfG5Gd0U0AAAAASUVORK5CYII=>

[image14]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAVCAYAAABLy77vAAAAsklEQVR4XmNgGAWkgFwgngbESugSOMB/dIEgIP4ExDxAnM4AUYChCA3MZsCiBl2ACyqGLo4MsMpjE8QmBgMg8WQojSFxGIsYhkIg6AdiWQYcBmEDuAz6AqWJMmgRA0SREJo4skaiDAIpsEETKwJibSQ+QYNAkmLogkDwG42P1yCQBCMSH5RWQCATKocPwwE207GJwcAuBizy36GC2DAusJcBizy6ZnwGWTFgqsGmbhRgAQDSH0pGnsT99QAAAABJRU5ErkJggg==>

[image15]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAVCAYAAAAnzezqAAABO0lEQVR4Xu2TvUoEQRCEC/RAMTTyAUSQAwUzUyPfwdzUXExELhYjAwMFwVQQDITDUI0E8RHEVNRU0e6bHumtG7ZHwWw/aHa6uqZ22B+goyOxJXUuNc+DFgYsCBssGK35X1KLtj6xvgb1celNmDD/gXo1XJNWwt/4TWqyOR6hszB/1jfCLQqnLFDr+XX+IQKDEXnWUPaE+bsIDIZ6luyqddMc49h0JszfRjJM84BQz4Lr703LDKnPhPnZ0ONBBbpv09ZX1jNh/h7KG2vIr0M5cGtPmH+GwCBcInkmSPcHyN8HM5a/6hvhBeWNnnckD79H1fx/r32Y/+kbpOGO65dNe3LanNS+65VTjB9cs6P8kXCB9Dg/pJ79UJhB8hyRfif1KrUu9YjkmWo4ElH+DyssVNJHyxft+Gt+x//yDctPabsuJmpoAAAAAElFTkSuQmCC>

[image16]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAVCAYAAABLy77vAAAA4UlEQVR4Xu2TMQ5BQRRFX6IgoRAlWo0F2IjKClQqhVDpJBagYw82oROhphI1UWqY++eN/1wjQilOcpO5581M5hdf5M8n9F0mLmUeGCouc5cmD0DV5WL6VcPAbXSd155Jx88Hc9qPxrXVWcbs+KKY4x6IuTtd8RtaxqHvTQ/A42VRMDxF3JIcgD/EJDLlgXi/YCmvPzmhI35YMu6riwBvwHplegB+F8rWpZjOEmIXnU0PwA9s4eex4x54cCg1K9TZTQ3qAF/y4GYqRi49XfMhsBbvCy5DXUfJiv/v3lFn8ePcACz+TfOFFZ6jAAAAAElFTkSuQmCC>

[image17]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAVCAYAAAAnzezqAAABLUlEQVR4Xu2UMUpDURBFLwSFaOkCrGwiasDO1jVYuge7CGIjNrY2sbCIlY1FINgIYivY2aUPti5ARWd8LzJc572JAbt/YCBz5/7zU4QADQ2JA5mhzBofKnxyUKHqV1Enf77K+yxorzQ96lX9z7Rr4YEyZhGp9yRzJ3MrM8pjX6CfQ/+KXYRHON+SOOQgw8/p/mf/BYKCsMEBknjV7LvwPaH/BEHBYUnmjbIBfE/oP0IqtPlQwRPew89D/7SwwIcC6/BfpD9OLw/9p/AfLKFdr38OPw/91wgKhHbHHApb8D2//Dt2EV7hP1hCuzccZvQW+j/sgnQ8Nns3ZxOTTdlDuvX5kFF35P8O9B+sJfMu82KPwjJS55JyZR/pdsYHQ+T/YZuDGdnkoMC8/ob/5QuefGJg3oHniAAAAABJRU5ErkJggg==>

[image18]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAVCAYAAAAnzezqAAABOElEQVR4Xu2UvUoDURCFB8VCtBMfIKCNjYKdrQ/gi1jYWUgaER/AKkUKg4KVINgJoqV1nkFsbSwNOse9N56c3OxsBLv9YGDmzLlnL/lZs5aWiiOvO69NXTTgxOtaRaE2/8trK/WDNDeha5Ne9Ic0Z8L8ocwwPImmrFrlWxBdwzGH+Ws8OC82HaRgX/JAO5Z57vyeBQarv0DW96lnwvxTCwzW7AKX1DNhPn7VMCzrgni0cghfYJYnzM+GJV0I8OCfkPlIWn7oA/VMmH9m5YMl8gNzIF/ggnomzL+xwFADzl2lfjvNylT+Hg/Ou5UPKvB0aF5PGoM5zB/xYNWSv9udpL2Slj/uc9Iw39IMkB3l/wj3Xoten15vvHRWrPL0RYeGV+tB6p8ntr9E+WN2VWjIhgoz+Gt+y//yDS/bbpmMbFU6AAAAAElFTkSuQmCC>

[image19]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAVCAYAAAAnzezqAAABaUlEQVR4Xu2TvytHYRTGH0RkoBSDibKYlM0fwGRUMposJCMxyMzIYDGJhVJKkkx+DAaDxWAgZWKkiPP2ntf3vM99+953NNxPPd1znvPc03u/93uBigrPvOhQNMCDDNZFG6JGHgjTKPqdoh5r/IgGtd7RPoc50bvpX0WPpndcwu9jRdxR7wLn5KUoLIL37BNfqBc0bmZ/dFF/hfRySwPSGeeNmf7U1NlsIb2cSf2c3J9Qn8UqiotSfKJ2iCm99kcJ4Fiv9jU01cZpluCDbTxIcIN4OXMgejF9M3yuxXgFwgFcuB5nog+t6x2CKc2toSQgjKKY2VOPfaY0s4uSAPx8gk1hE/G9rr41ffCi/SO2Ed6Qd4BJNpVwb/hUn8zMUTjAt23gh8umH1Lv2XgL6jH38LNAKuO8WTaO4D+PL8T/Wkc7fGab/Af1V+Bfh6uvowTQof6MaFHr/ShhGGYjk25RH5tEq6iXzYp/wS8dcWrUStKxRQAAAABJRU5ErkJggg==>

[image20]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAVCAYAAAAnzezqAAABZklEQVR4Xu2UsS6EURCFD0KIAlEoaBQalUTnGXgChUSlIZptiEhEIyqNKDQqiYaQSEQhKiqFXkXQeQHCjDvXnjt7/9y/VOyXnOydM2cns7t3f6BNm8Cq6Ew04Rs12RTteVNYFHU6b1A0wsa3aNLOR1bX5QRp/pPOyh1C3yvh0dUauHFejl2kwxasXiHv1ryoOer9Mezqe2S2zKCZeec9ufra1bU4QHmBZZQzypU36rCF8vD4lY6J3kTnVse7FLm0V/4ZuprtPOsIwT7fIOKwF/I07xc/Fb1S3Y2Q6SGvhbiAhquIC3iqfKaY2UYhgOohVT5TzByjEBDekc/44Xp+oDp6yXtnuBA+kB/O6G+Yy/DwDjs/N9u/tCzwxQVCc4PqKfP4winq7VOtt1s9vmBVS+rfODEuEAboo5RvrdKPkDl0fvyEO6KGnWeTBDBg/pJozc76+M4y7Y2aDInGvenoFY16s82/4Ac/72o857+OxQAAAABJRU5ErkJggg==>

[image21]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAVCAYAAABLy77vAAAA50lEQVR4Xu2RMQ5BQRCGN1FyA71CK/RarUat0TmAKNQ6icI1xAF0JBIREioqkSjFBZjxZnb/HatQ8yWT7P/NvMm+95z78w1VqhlVyTaAItWUqmkbyoOqLuelZAu7nZzzknOhnYkLCnF9yB1xyNA6Dl0U4nDIZuVtUQuFOLvoDFlhzzfzoR163tlFa8gKe/9ZOIxCzzu7aAFZieauGIiy5K8XMXOQ48QAnzeQFfYnK5HUojtkhX1Pw41qH3ovogHJ0SsIkbNDE5OZWsIdrVtRHagaLru+fUDZuqxXoBrIOUnFig/wX/0lng8WVI5aw2gqAAAAAElFTkSuQmCC>

[image22]: <data:image/png;base64,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>

[image23]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAAAZCAYAAABjGPHdAAAEFUlEQVR4Xu2aW6hNQRjHP3chlHsup1ySohRFSXmQIlKIPNBJKEmE3FNePHhQIrzQccmDIkURchS5vHigeFJHSRJJbuU+fzNz9re/PWtfZs86e+195ldf65v/zJo131prLmv2JopEIhEP/npaJBKJRCKRhkVO+8WsTZ/SUMgYi1mbPiVSgrNSKMEMKSguSCFt8ICHs3QPo11mGoC2SWiNQGePPwR9lDUre025QaMS5IAD65lXImWeK+sttOvkDuSqFBqAzh6/BC/fVCmWwThli41fbUc4L/I6BFeDkwJ5J4UasI902wbJDE9ccWY5/rTpS34dgZN0/4rxSgodzVYpUHIgLq1WbCTdnpkyo0LqNf60GEidtCNIMDUiiHMyI6PMI93edTLDk3qLPzSYaWvVEe5T7txl+dntNFGujMuC0UqBK+wgxpJu9xGZUSH1Gn8oatURZHmkbwkNszf0lSaNjQuksbkRHJ8gskQ/0u2/IjPKJIvx75ZCitSqI0geU2EdSA9xaLLDBCFEEFkAMfisO7MY/08pBOKrw74p++7QYeUS4h7uJ13HRJNOqhPaXSlWC/aCUfEZmVEndCfd/gcyo0zqPf4Q1GJGcJU/aLRmk4Z/oj03B/TJUqyWh1TYIM4Pc9xD+eUwWixRNk3oYADpX2OxN2/5pGw96a06lF/I8nzAdIl6TsuMCikVv4ubyt5KUdGi7IvQ7Kh6kfJnq8/KFhgfxxXGt3FJuil7o+yZ0Fuo8JqVkpWOcFto8JtYGhw3enBcDbJAxw9PsnF2+xG+HZF3GK1V2S7jg7nKVhsf5YYy3wfb8bbJDE+Kxe/Clh3M/F7MB9bHcbxIu47blf0yPgaXvcpOmTTAIHTN+DhnAyVf04e0O4LN68o0DAQSWQf8VSxtNV5PVdgLuuwoK4eHfYP0g7GgzGzmS6ANI/2Vb9e5s1ieBf4kli7FUtLnzJcZHsiYk+J3gTIfKH+kgoaXCf+dwajdxeiYGZ8oW2vSFuhYBvCPezuQAHlfZRokXdMH346AF1LeP2uclw4NQDumbLnxk8pcotzfOGoGvzhumE0fosJ19RpKbiweNJYUlqRyLlAWW6VZADPke9JtGmW0YrEk5XEdsyqH52H0d9Xh0nzx7QihwCyfefgNxwg/x6FbppDuuZwx5ojymM7BCGW/jV9PIIaRxj8pdM4W5ss8C9f/MB8f/TjfznyLlN3JZf8H91TWy68ZCYxd/+Ob4DAVn74t0EeTXso8EjoeONbM9dgJwEfSH/n45uEfvvj78WZlE0hvQ1rs/XOBzQN8D2Da5zwlvbTk3wiooz/pb4UXRku6ZiQFsJTB3m4Ikl6ISCTzhHp5Dyi7J8VIpB7AX58x9eJYDdNJr193Um7rNBKJRCKRSCQl/gGzZXEiRhdryQAAAABJRU5ErkJggg==>

[image24]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAZCAYAAAAIcL+IAAAAgElEQVR4XmNgGKbAAoj/A/FPKA3CUigqgIAJiJ+jicEUo4DLUEFVJDEOqNgTJDGGx1DBRGRBqBiGqeiAjQGi6De6BDr4w0CEadwMEEW26BLoAKToNbogOgAp2I4uiA5AClrQxDDcmQ3EMeiCQHANmaPOgAgzdIwStuiSyHgUEAYAPGgpc24jaYUAAAAASUVORK5CYII=>

[image25]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAYCAYAAACWTY9zAAABuklEQVR4Xu2UPyiFYRTGj7+RWGxYKRaDxZ9iMEjKILNJWY1KIimDRaQYhAw2KYNSMlKSQhapq0QsIjEgzuk773Xu876frhgM36+evvM873vPd+73vfcSJSRkxS3rjPXBqoQ1i6xnRRtri9WFC8Aga4NVjQtMB2XeUOoHVqnJ+jUvNFksslGaNmgtKs/YESF5ndYr6i3il4y/02sTa4E1xCpgnaR3fAM2F9xwmB0Hsl3wo8aPmdqBfWMJDXGhWavJxONT3NfcIfW08YemFk4py1covJI/2KpmPerb1SPzlJnLoX8y3q4Vkf/Efww+xWXwjnHyc/FVrEVWJ+S/RpqkjN/RDBmmKC+GvBb8OUWH3lFB0a/7R8iNHiHb1hxxg9mbIiWsI+NTrCmtQz2DvLAOMGRmKNxkgsK5Bdetl7+nGuODyECzkHXrtZ78GwhrFM4dl6w84/vI3y9vI5ZJ1gBk4vONl4bNxgv3mocoY+1BNkf+/hvwaVoo2hyS5V1lkT0jkDnw80Ij+bk7bx44TNxggmSbFL2eN9Z15nKaK1YOhort+2zqP0EObRwy0DqGhlz6+uK9sJaQkPCv+ATBC37i02LpPgAAAABJRU5ErkJggg==>

[image26]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAAYCAYAAABEHYUrAAAB+ElEQVR4Xu2WzStEURjGX58ln4UFWbCSUmRhw45/wU6xsCDFzgIrfwKxFyullIWwEitFRElRkx0pxcLC5/s655h3nrlnzJ0ZM5v7q6d5n+e8c+85073nDFFERESB+GKt2k8f7awLDPPJJGubNYADwDJrAUOLLHDC1k3Wr8eHf7i2ecGQmxfbesh6ZJwSc6l3lHdZkB9hbbCGWWes8t+OPIMTFOZZN5DpH0RnYXwZ/cPjO0fmRqU4EABOSGimxHwFvEOyO/Cav3xWbJG5YDUOpED6RTUqu2dNKe96EMylblD+VNVXlKPH1730RTiQBoMUn/Qj65DM9TS4KAfmbcrrvIJ1rnxGPLPeMMyAVopPXNSRMJq8KIcvxx0de2bJHD9p8cl6wDBD6ig+mSdbi+S9d/gW5cs1t2Q2Jof0yxPYyTpQeSDSvIdhFuBk622mc/QOX+6oYp0ov8Z6V/5D1SmRm+DxEJZp8k82F4vFMfFHyi+pOi1eWS8YpskYJU/IofMZ8A7JfI+iHEklkEn/vvKjqg5FjMy7HJagRcjRhbn4buXlGMEeRy2ZXR2Rfr3TH6s6I3bJXBR/VR9dZPo3WX2sS+uRFjJ5P5nNRWrcdR1B3xf00ST4+kIju2kPhimQv4K9GAZQyWrEUBHDAFgks8icLTQiIiIiIld8A5Q4k3zudmZzAAAAAElFTkSuQmCC>

[image27]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHMAAAAZCAYAAAACLBHaAAADAElEQVR4Xu2YS8hNURTHV5TIIwNGnnmWkPAZScnMSClMTEwYyIwkSWRi4EshysRQmchAGfgyoZREMaLkEWYiZOCx/+19uvv+79r77H3uud/Vbf9q1dm/tZ933XvO6YoUCoVCoRDlt4n7JvZyYkTBWRF/OZHDT7ETpMRk8p2FY4GJ2yZ2cyKBMRN3TKziRANmmJjDMoHLJs6w9Gjlc44V7JaEc4NCKyb28Nxdz3TtqZ10FPTd7q4fuXYuy0yck85ntaQ7HeWQdK+J67teu6LJvnrAJJ9ZerSySAZczIPSu4fzitNAnw+KO0mujuNif90gt5joP0VxjOayOCV2ktWc8MhZ5LDY/u9M3DNx08QNE9f8TjVwMTGftgfN+awX2+cI+dB8qeQU84roa8G9VVxfaAdbbGKb157wrmNgnj0sG6AVE18OBh6/0BDjYvvsI6+dOYecYobW0jy3s2lr0o9iX1DaQCvmE3IAnm+hPrg1os8B8tqZc/jvi8mRS5MxIbRiPiQHUvaK/EXF1Y2LgbFLWQYIraV5bmeB12RMsIj8D2rXMd3EZpZ90GYxP0l3nzWuXTcuBsYuZxkgtJbmuZ2FNuE8Exu9Nuc11oktQF2kwn2xh6fkAPxrlgoT0jnrJe+6KRi7kmWA0Fqa53YW2oQMnoUpnGXRB1oxv5ID8CdYJpBy7hgYG3v79wmtpXluZ4HBb1h65Eye07cOrZja/Jpjvph4Qa7pl6AC43G7TuGY6PuEe6C4RlwQO3gFJxy/JG9y/BvzjWVDuJhbpHcvrxSnFZ3dVWqD/c79IR8CfdeyNGwQm3tPHg65imnOMZqLgpeb6oB1kfqQr5grdlzqLSgEFxM8Ezv3LBOn3TVT7dvnsYmXJnaKvVVzHswWfawPfzZ+VFR/M173HFjo/FaxXwJc7+jqYYmtPzTGpPfAORvVilmRentjNrFQyNljE1Ds+Sw9Br3+UIgVc5Dw32uTTSlmS7T1vO+HUsyW2MViCIxkMatn7FFOjChN3isKhUKh0D//AAE/JKCdqFBAAAAAAElFTkSuQmCC>

[image28]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHMAAAAZCAYAAAACLBHaAAADMUlEQVR4Xu2YzetOQRTHT6TIS0Q28pKXSET4SRY2/gGlsGBtY2GjRCRvC/2ysKIsWElZkIVS/HaykVhZEHkNSRFS3ubbzDzP/L7PeebO3Oc+v1+e5lOn7nzPzJlz59yXuVekUCgUCoUov43dNbaTHQMKzhX2lx05/BAbIMXGkm8sOOYZu2FsOzsSmWJsBouZ7Dd23dgydlQwQey4o+wIaGSdYwW7Jt19/UIrJnJ47I6nuvbEtrsri42dkvY5LhztzgLjV7rjy66dwgdjF9zxHLHjXrfdLVLjRUGQ9ywGNDJJBlzMvdKZwxlF0zhobMgd91LM8GIKtRHSNNDvYdDGawTarEADKecTBbc9gixnR0DOJPvE9n9l7Laxq2KvYn9lpsDFRDwtB02L0WsxZ5N23+lVcP7PXXt9oIGUWFF4IrDA2JagPRIcx0CcHSzWQCsmLg4GOu7QVOoWc6t0rhE4L7pehbbmQNOy0AJzO4V3YjcoTaAV8wFpAPobFiPULeYl0dfkuOh6jHVix2xih+TH6sAXky2XOmO6oRXzHmkgN1f0XcRiAndEn+ewWB275CqGpZ3vCvJ5tDmS8VfWfNK/U7uKycY2sNgD/SzmEhYTwLtfm8cXcxI7KuiWt6YlowXF1hmPAg/7NVaLLUCVpcJ9kUO4G/RAf8ZiBPTP/T4E50Rfh5Oi61XMFTvuC+l1YrXQisngXZjCCRZ6QCsmnziAfojFCOgf27V3Y43o63RFdD0EN8cTFkVfe25ngcEvWAzICZ7TtwqtmFp8TYuB/v6jPxeM3UzaZ6fH8LmfDjT87NDOidvJnBU7eCk7HD8lLzgS/MpiTbiYG6Uzl6eKpi1QCHyrWDTsEev7w44AfOjDQjDmSNBe67Tw785Hp4Xcctou0rlfJdjc+JOustzNwkyx4+o8ykK4mOCR2NjTjB1zx4zPW9M080xXNA34b4q9cH8Zezva3frNeJF0aJ+M7Zb2zhg3E1M1/7gwJJ0Ll5OoVkxP3cdkCqk58p+bVPCfGD/cu5E6/39FrJj95CULY0wpZkM09b7vhVLMhtjGwjgwkMX079gD7BhQ6uwrCoVCodA7/wC0yhwy8Gy3sgAAAABJRU5ErkJggg==>

[image29]: <data:image/png;base64,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>

[image30]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAZCAYAAAABmx/yAAAAjklEQVR4XmNgGNngHRD/B+J2IH4BZQtBaZwAJJmOJiaFQxwOFjHgNhWXOBiAJL+hC0IBQY24FIihCyADmEYY3oEqjR+gawbhDhQVBIAKEL9mwO98vACvRlcgtkIXhIIZDHg0/gLiMHRBKABpuowuCAO4nOPOgF0cDkCSoVB6GxAnQdl4NWEDZugCo2DQAgCmmC1YQ65yuQAAAABJRU5ErkJggg==>

[image31]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAYCAYAAAAcYhYyAAAAqklEQVR4XmNgGAXEgO1A/AaI/0PxByB+BsTPgfgvkjhRAJdiFgbcchgApKgKXRAKiDKklQG3IiEGiNxndAl0gM8mfHIoAKbQBIhNgdgWiA9AxeIRyvADkOISNDEZqPh9NHGsAF94gABIDhTteAEhPxOSBwOQgl/oglCQzQCRv4kugQzEGSCKnNElgECAgYAr3IB4AwNC0WYgXgjEc4B4EZL4BZiGUTAKSAUAyQA36mV7BNoAAAAASUVORK5CYII=>

[image32]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAYCAYAAAD3Va0xAAAAm0lEQVR4XmNgGAXkAGYgfgTE/6H4LxC/AOLnQPwNSVwEpoEQgGnABtYzQOTY0SWwAXwGgQAheTgAKbqELogEiDIokAGiSBhdAgkQZdA/BsKKiDKIGEXEqAEruIguiASiGSBqtqFLIIMZDIRtIto1+BT9ZsAvDwf4DPrDgFsODpYA8SsGiMIfQLwaiFcB8TqoGAjvhKseBaOABgAA3Kc3M+PeVuEAAAAASUVORK5CYII=>

[image33]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAaCAYAAAC+aNwHAAAAsUlEQVR4XmNgGAXYQAoQ9xGJsQJuIFYD4v9QLAfEAkAsCMRKQByFJIcXEFKET47BjgGiIANdAgngNeA7A3YFdUjsz0hsDIDN+SBDiQYwA9AxUcCJAaI4DklMFipGFPjJgF1xBRL7NBIbA2BzriQQMyLx0eVRADYDkIEBEDejC8IAHwNE80J0CSSAz3CGOwy4FXQxQOQ+okuAwH0g/g3E/xgwow6E/zJAAhdv4hkFIxcAAD29OkzbRx3fAAAAAElFTkSuQmCC>

[image34]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAZCAYAAAA4/K6pAAAAn0lEQVR4XmNgGAXYwCsg/o8HT0MoxQ9gGtABLnEMAFJ0E10QCAIZIHKz0CWQQQgDRJE4ugQQHGCAyG1AE0cB/xhwO5MoL+BS9JUBuzgGgBmAjvWQFeECwQwQxSJo4rhchQFwKdzNgF0cA+AyAJc4BgApuoEuyECkAZkMEEXS6BIMmAagGPYcKoCOkcEvqJggEN9mwJ7IiAKa6AKjYMgDAB4SPpq9FEO1AAAAAElFTkSuQmCC>

[image35]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAZCAYAAADe1WXtAAAAx0lEQVR4XmNgGAX0Bu+A+D8Q/wPidVD2K6gciE0SqGSAaJqDLgEEKgwQOZIM3cQA0aCGLoEESDJUlwGieDO6BBoAqclCF8QFiHUBMWrAoJYBovgqugQlAOZKRnQJSgCxXicJEGsoKL3CAEH1xBqKrIag+ukMEEVM6BJI4CaUXgvEt4D4KQOqy7ECfK49AcSOSHxc6rACmMHfgDgRiHdA+egAmxhBoAjEAuiCSIAsQ/GBpUDcB2W/QZagBDgwQCL2BZr4KBhKAAA5bTdxuj6GjAAAAABJRU5ErkJggg==>

[image36]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAbCAYAAACwRpUzAAAAbElEQVR4XmNgGAIgAV0ABgSA+D+6IAxMZcAjCZLAkMwD4gKoxGUo2xQmqQ3lgCRBbBBmhEmCQDBUEiv4x4BHEiRxDV0QBkCSkuiCIIBunzsQi8I4hxhQJVHsDkESANnLhiQHBiC/NaALjgQAACAjF5FHYAkLAAAAAElFTkSuQmCC>

[image37]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAZCAYAAAA14t7uAAAA0UlEQVR4XmNgGAX0BP+xYGLkuvDIwUEDA0TCAE0cBG4z4NAEBfjkGNwYIAqS0SWAYB4DRI4XXQIIDqELoAM+BojmGegSDAhvOqFLAMFjdAFsAKT5HJrYJSA2hcqVo8n9RuPjBNgi4AYQM0PF1yKJg8Qakfh4AbrB6OxHaHyiAbLB3ECcj0MOFNEKCCnCAFkzuovwyREEMM3hQCyKQ24rmjhRAKYZm4tg4q/RJYgBuAwFAXxyBAFI40N0QSgAyU1EFyQWKKMLIAF1dIFRMAoGAQAAKS1JmzKSCXQAAAAASUVORK5CYII=>

[image38]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAZCAYAAADTyxWqAAAAmElEQVR4XmNgGAXUANxA/B8LNkBS8xSLPF7wlwG/IpBcFbogLoDLRkYG7OJ4ATbDooH4CpoYQaDPADGoAEnsGRDbIvGJBm8YUF2FzZVEA5hmIQZERFBs2Ewo3x3Kvw5XQSQwYoBojEETJ8t1nxiwazrIgN0SvACfC/DJYQX4NMDkQFkOJ+BiQChExlpIatDlcFk4CkYBTQEAbEs95sKfPGMAAAAASUVORK5CYII=>

[image39]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAZCAYAAADaILXQAAAA+0lEQVR4XmNgGAWDDXQD8X8oPg3EH6FsEGgB4mVQNskAZig2AJNjRJcgBNgYIBpfoUsggRUMuC3GC/C5GAZsGQirwQBfGCCa5NEl0IA2EC9HFyQEiHE1WaCUAWLwB3QJaoA/DBDDI9El8AA3IJ6LLogNkBIki4H4HxKfoL6tDBBFKugSaOAJlEY20BSIbyLxsQKQhgvogkiAC4iXALEjA6rhHGh8rOAoA0SRALoEEAgzQLI/CBQzYBqGzscKDjMgwr8aiDuh7EQkNeFQMRgAFQNEGQ4DPEBsiC4IBdIMqIaJofEpBsiGZQJxLxKfYrAUiLOhbKq6ehQMUgAAgj09GJY6i78AAAAASUVORK5CYII=>

[image40]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVYAAABNCAYAAAD9yUxvAAAFnUlEQVR4Xu3cW8g1UxzH8b/zWU7JIZISUc4lF4pyCJFCClevCy6EHC5Qyg2FxB2lFHKlSM4prztJoRyLknIIOZ9ynl+zlv1//8+a2TOz9579Pu/+fmr1zPr/55mZvdbMemevmec1AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFbDIVX5N5Uvq/JKWj4/5bWMstxuvsiphbhvxxg/x+VWVWwTXz5y662yXWxt26gc69b5rJDHyP6wuuH3i4nK71bnvooJbKLt5G3L3WkMGNE3Vm6vR62OHx0TK+pvK7dTptwtMYhxtF30mfJHxSA20daO03JDzfK7m7Np7dWUa7K9bXo3t6VoaoutrBzHSH6xbh3QZZ1V13SSH2bNueursnMM9lDa5pagqb2kLddEX51XZWC9rCrvhBhGdKDVnfJXTBTEzsNaH1i5nfLJX8r9EwM9lba53u1t9ee6OCYqT1uduzQmptjDFj+w7hkDC3aM1W1xnYt9XpVTXB1L0HSxrwcvV+Uaq4//QRc/OMWyMT/jI1bva1sXu6sq26V4PI553FXEbXa1ObZf9raV93m21fErY6IDDdZDBlb13Y9VudnWHpPqF6Xln1N9THEeehl9hYKxOuI5m+yra5nmmfRT6/q7vp9SLHst1Bfpaqv3dbKL/Zl+vply3uuhPkTcZlebY/tl8VzI5W6/Uk9DB9b82e93y5L/scw0h6v61i62aLld9rLJQ6yx+wpBntzu0xG7WT1IHhETI7vPLev4Dw/1H1w9x7Ib3XIXelviixhscJLV+7o21fW1LHso5fJbF33avc2Q7Qxtv1utHmD6uM36H6PWj1MkG1N8qKEDax7M47XyYqiLbyf/LaAr/f6ZMdgiH1Pe11mp/v7/a2B0+1jdCZ+EeInWO88mF+RpVl8wy/awlU/u40PsvRT/uipPhtw08YJqs43V6z6e6rr4sqtSTu24e1WucLkuNKeoB42xaJsxlss0fdrvO1fXOru6epvcfnqA18W+Vq9fml9V/IEYLIjtoPJrVX4rxLu0k2jf+4d6qe18TMs6J7rQQ8z4+23UR1r38hDvsw0sSJdO0HzhBlu7XqwvQzx+3ZHE49IdwA5p+VXrP7D2/Wqn/X+cfnonpNjthdwsZtlW1/bbKcR1RxvXa6OHpF19aOVt6zgUvycmOhp6xyr32tpjUj1++9FcrOKaFhAt3zFJT+W/OUyT9xXpHFc8DrgYUbywSnI+rhfrbXQXclPP0oWOQQNV9kKKeb4+ZGDtK7fphSGep140F6Yn1PMSP28ffdrvDBfTWyRxvXlpOifzPvUAa4hZBtbSMcW6BjL/0FLiOvNUOqasLYcR6E5OHfBUTCS+c2JHxfoy6Bj8QBlPqB2tnu/KNLA2fdZ5icfgteWGmmV7fdsv0zpxEJmXeAxZjucphb4P/mYZWON86iWprimdzOebPsM8te0j5/TuLpbkUJt0xEtWv4KjP2HVVw0vdmKsL0N+NegJq+fP8ryxHnwopv/vwNPAqvcgF0n714BUsog2m2WbfdtPNCfp5xrnJZ+Dvhzk8nkqRX14nPX/E+BZBlbRvr+tymNVeasq76aYHm419YHiQ++wS/SHJLGNVI5068Rc07FhRCfGgBM7KNbXA12Uz8bgnGmwajLPKYBszH7YaJOHMRe4+Jg0+OvtlL5mHVi7Otctf2/j9g/WoXiCxPp6oIH1+Rhc506PgQW5IdS7Pk1fJeoLf11wx4hO8p++fmqLuftapDdscqLrpXd0pzcj4tdL/9ALE2qbA6z+es6gCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgC3Lf/SH5fUSXXSRAAAAAElFTkSuQmCC>

[image41]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH0AAAAZCAYAAAAc5SFpAAACwUlEQVR4Xu2Zz6tNURTHFwaEiTITAymllPyMCSP/gDFTQswUSiiFCWVk9CZGKE8UA2MMSIgoRhJJCQPl9/629353ve/d95599jn3nvdqfWp19vruvdY69/zYZ59zRQzDMAzDMIyZzDJnN53t4g6jW/45O8hiCyDvs9BeFPx5vW6ja5aIPylXuKOQveLzac4nNGMGgDsRJ+Yxd9QEOVInOKUZNZnLQov8dfaZxUxwct+xKF7HHZ/FPWeHxAddVvqKoEUGXWGldFUXuVaHrQYnImrxrnzQ6x4JX539YrEC7FdqtoD+nsVB3A5bBOGHR74HLfKQ/KZ0UfeaaiMnFkHav0X+b+WPEtTayuIAMPY+i+L1rON0UbURgDtA+7gSNTqpjq1Lad2rzg7ojprEPBdUOwJfr4D3ODvnbIOzSWerVF9boOYrFitofNIjE9IfAH89aS+D/jxsm5JbFwcm3gn7pT+mLoj/o/wjQdMcdXZH+XgGv1B+KQvF19KzSh0Q+4RF8fpbFofBV8k68sFOZ/OVz/0l5NblKR/tTcqvC+J5duG68H86+xT8iaCVslJ8PGaPJiDHNxbF68dYHAYCTin/btA0VX4JderqqRda6XS7VNI1eBH0kXyMOUxaDjvEx+Jx0QbIxfsPUtpQEHCDfJ1kgbPjygdVRThHipK6a2V4Xs6Rgvs5Bo+xyFnxfVuUlgviNrLYkM3Sv/9vElol8TXpurMf0rsbsKqGxlc9qCrCBzJFV3U/iB9zJmzjV7NH4qfzbb2hU1yS6W8ZXfJU/P4udnYytMdCTqHTLDRE11yu2kxbdbeTn/Obx8kaFkZNzgHIGZML55pDvobHloI88VmMf7XayjvrwMeSuJp+7Wzf9O4psFo9wWIhX8TX0zaINuvin6zdoY2aesWfA15tcw2PmFlP6lPhOOiqrmEYhmEYRqv8B4yF9RbhVTJ6AAAAAElFTkSuQmCC>

[image42]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJ0AAAAZCAYAAAArBywYAAAC3klEQVR4Xu2YOYgVQRCGC29URHERRDBRMBUNBBMjTd1ANFExNNLAA8TIQFAED4yMFsRsBQXFAwzMNDAQRcFcUUQUbxCv+pnqfbX1mrfT3fN2Z7Q++Jn+a6Zrepp683qayHEcx3Ecx3EcZzCXbcBxmmYhax/rJeuPqJPMY623wQ7Q2QkvYA1ru7Q7XXSLyIuui3S66JbS8ItumQ00wLAnfJYNtIziorvHOkBVkksqvlpigeIbRVhOeUU3l/WJdYz6xwS/Q9pfxDdNbk70WydHzW8Vmy3tB73TraO4Fm7KEUnw8IHPEgs8NL4JcosujOOCagMUo/ZYM8I3/ebImYdx1UZ/LC20v2H8T+VTuUW9wqirFHL6THBetZEEv0LtPyofYgHdN5fcojsjR/vwd40HwR+nqkibwN6jDqHPOdUOwOMNF9jLOs3ayLrOWqvOtQE771mMUX8S+A0m9lziT+WYwteIvrG+R+JQHTCGlcbbccF/MH6x8oOwYwpCDhuD6hQ1+v5S/qjENFg23Fb+HeuZ8jNNbJ6TsUnw9rFJt7HmK2/P55D7pgNnqX8M8IdNDGs/fR3e3rZfKiX90df+o9h88D9Yb8WPSawtxMacDBKcUP6OxDRT+RxKii724NbvZs1hbVUxrJXsdank9h+h/r7wr0zsjfG45qCJDWIF60iiUojNfTJIcM14nXQBVWsiTfFNqazo7Pptl/glKhYbI2IoxBJieeti+9q5xhImcIqqc5tUrA3YMWcRtkeuUrXGCr9IfM0iZn95oPimVFZ0AGN4z7rCekzVugcxfGjExod1l14D5hLLXZfXVPU/KUfsI+L4iKq/0829Sye4SJN3FmYC7ACEYrOaNpq4WWnRpXCfel+IoyqeQxPPPhVbjJ+Oe7aeLk3CIePxxithpw0MAcwvtk7AKvH/LdgkDhvHL1j7J59uHbG/Bf3R1FaesPZIG2PWX7yO4ziO4ziO4zj/Bn8B3Rv5Lg16AmgAAAAASUVORK5CYII=>

[image43]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVYAAABOCAYAAAB7XT7BAAADK0lEQVR4Xu3czYscRRQA8IqEHEQh4FURMX6ACAbPgl5yiPgHBE+5Sk6CooievARBohc9eFJjPBghESWI4CEIggheRPQoCioiCkHUxI96Vjfb+5j0dtidnR7294PHVL0qut8OdE1Pd8+WAgAAAAAAAAAAAAAAAAAAAAAAAAAAAADALP1T4+WcBGB7/s2Jzi01/spJALYWC+t9OVn9UOPhnATm7ZfSDur4Ovpu1/6pG7vaWdSqvVBabRGf1fita4fna7zVtdfJo2Xz+72/xtkud67Gk4MxYKaeLu2gfS0PVIfKxsI1N2N19WP78sCaWPR3LcoBM3S+tAP2zjwwMLaArcKB0urpz6YXebvMp+bHR+L+wbzeV6XVfmKQu6PG5UEfmKl7SzuA38sDScx5LCdXaMpC/0DZes4cfVfjYI3by+b6v69xdNAHZmrKAhWmzNktl0qr59Y8kNxT40xOLtl1OXGNfq3xyKA/fN+H7Vh4gRl6trSD9cs8MHNTPwx20+81/ijtcsrrNf7cPDzJzzXeSbkfS7tUE/4ubUH9fGMYmJt+gVrmzZ1+H1NjK0+UNi/O7OYi6oknKHIO2IOmLmZzcqW0mo/lgRE31vigxt15YAuxnyM5mcRZZH4PP6rxasoBe8TUhXV4NjZl/jJNrTm8Udr1ylNd/6Eaz20Mj4q79VP21c/p4+Oy3G8AwMxNWTjCcM6U+cv0fmk1xLO1Y+LOesj15v6Yu3JigdjeUzkJ7F2vlLYwjN3J/rp7jV/9fFPaIz/5euKYuCZ6LTFF1PxFTg5cX+PNrp0X0tzfrtjezTkJ7G1jZ62flvb1uXe1ebvtk9JqWfTI0U2l/aS1l2vO/e2K7b2UcvFBtdP7AdZMv7jGI0PHa1zo+tmi3KpcLBt1P1PjZNeO+odyzbm/E2KbH5Z2TTfa8Qrwv9vK4rPA3jIWpe26ocbhnBzINec+wMqcrvFi144H2ddFXkhzH2BlHiztZlf8P9B1E8++hm/L+Bk5AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA77j8fqL4gwF0H7AAAAABJRU5ErkJggg==>

[image44]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAZCAYAAAAFbs/PAAAAcElEQVR4XmNgGJ7gPxQboEvgAzBNRIMpDCRqAAGQhgvogvgAyc4KZ4Bo4ECXwAdAGn6hC+ICixhIcNY2IP4CxCoMEA2mqNKo4CQDqql4bbnFgCn5GosYGDxhwCHBABEvRhYwhwoyIwsiAbzOGgX0BwAHTyCbAwwJYAAAAABJRU5ErkJggg==>

[image45]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAVCAYAAAAElr0/AAABp0lEQVR4Xu2WzytEYRSGT4kS2cjKgkhKihIL2fkT/BG2lhopiY2lUhYWrGzJQinJRjYSazZ+bZU18b1zzzfOfe+de4+arO5Tp77znM87c0bdGZGKiooydkKts3TQH+o41AIPiKVQR6FGeGDwZoHOUD0sLd+hTlk2AXfv9dylfdvvuAH8mJ4PtGc8WUOhNnWGGkiPs+S9ELMo2XtbOc6+QesuTO/NWg41rWf3Ik8sifipMOzQ95K7Vh/xZlncixSFAMyfWUri8WmCee2ZXckuUpbFtHSRG5aS+Fc972vP4KHCi5RlMS1d5IqlpP/23JwtK5J4PHmAJ4uBH2TJFAVEPC9+Zs6WuEi79p4sBn6YJVMUEMH8lqUk/lHP29ozG5L2niwGs6LvpDreRT5YSuJrep7QnjmU7CJlWQxmoywZXLpkSTRblh36WXLv6iPeLAtm8Us2lw7JBkyqezFuRp3lIcd9aVlwZ9X03iwLZuMswZwkA1zA898SfzLskb9T3x1qTc95wJ9I8pPjM9RbelzHkwXXrBrgzfZZ8QcK/8WGKRY5eLMqKv6TH8NhqVfhM6b4AAAAAElFTkSuQmCC>

[image46]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAVCAYAAAAnzezqAAABRUlEQVR4Xu2RsSuGURTGH2SQ8Ss7ZbFQNqviL1DyR0hWMchMWXyDgUk2ZVOyYjRYDBYpEyNFnOOe632c9+a8lO391em7z3Oe+3y37wNaWhJLMkcyo37RgE2ZLZlevyB+7H+XGbPzvukmLMo8kX6QuSWdCfuvnNbAmfNK1IqQPP4lVIf9HRbCOcrlTA/KGfVmnf51fxdBwNCMz7GedjoT9q8jCBgvqB6xYJ8jtN8zzxP2ryAFBvyiwCWqR/jS04KnhP050O8XDv2CZzuXHnHidCbs30D5IjODeubQvOxv05kJ+w8QBJD2c94UdlDdHaczU+ufYiE8onyR0f28Nw2+q+ew/40F0nKV9IR5d+Qtm+e5RtpltDvq/zSOZfpkXmXueSkMImV2nX9j/hrS36Hni2+JRNT/xaQ3GjIkM+zNAn/tb/lfPgABrW4ZfVRNdgAAAABJRU5ErkJggg==>

[image47]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAVCAYAAAAElr0/AAABx0lEQVR4Xu2WvyuGURTHDyKiKMlgtkhRyiCb2eQ/sLC8ZSYlmYxKGQxMyoIUIcmCBTGz+LUqM3HPvedy3u9zn/c5i+351Kn7/ZznPc9z39739hCVlJQUsepqEaWBHld7riawIUy6qgfX4aobHFM0KzLjatdVLzY0364OUebA197LulVyw1/bcykeC7HMYtj3yXpTci41m8IUZa9bTrhzcbHGq9se6yy9We3OwP3CzSeUQHwwBN0J5BTWWZw7wV2JT5I3WMP9Z5QUPH+bkSO1zsMya0wyskZp77Fu5BolBf+q8oHysfC3b5m1IRnhAyrlPdaNXKCk7Gd3XL2p3Eih36ScZdapWmvmKPgWbDD4MCksN88Dr7HMOlZrTdwIf0EZ8EYpuH+LkoJ/RAngfMusFcnIEqW9B2+UgvsfKCn4Wcg3KkeHGymaNSAZ2aK093CDz/9a4MNEtKuTjCcSfhZzBB3nEXDv4jPwnxAbg+JelBsWp3lIOMwMu4rK1llfUhq+Zl6LUVf90uAzWxNfGdbB34lvc7Uga6Sdgp+m8DPh9XbVFQHLLIb9PoUj/JOqT0QPP2wXSiPx3acWzRReCouwzGKGUJSU/CM/mQ63b31MZ1EAAAAASUVORK5CYII=>

[image48]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAVCAYAAAAElr0/AAABrUlEQVR4Xu2WzysFURTHT4kS2cjKgkhKihIL2fkT/BG2liIlsbFUysKClS1ZKCXZyEZizcavrbIm7nfumef4zp15J2U3nzp17+d735k5r9e8EampqWnGdqg1lg56Qx2FmuMgQXuoLpYGb6+FUIehhjiwfIU6YVkCzt7pukP3LT9xxkCoDc1Qfb/jBp5eAH5E1/u6L6UyVOaleG4z4RZDTeq6bBBvLzusdefkGiB8ZEngDF8IpFxO2SDeXth3k7tSn6SssQX5E0uJHt9miqpBmvWa1T2zI2mf4R3kmqVE/8JSqRqkWa893TN4QKV8hneQS5ZS/Vn4fpbi63Vm1pZliR5PxAJVN5PjuTgDP8hSfL1OzdqSD9LKAai6mRzkNywl+geWCrLUs9/Ta0v3zLqkfYZ3kHeWEv0SSwXZMEvx9RrTPXMgaZ+B4IIlUTZsyuUgy//MLN5e2E+Te1NfoE2Kwbi6Z+Om1FnuE86CbJSl+Ht9allwZsWKGYkXQYBntiV/Zdglf6u+M9Sqrhm4srJ4egH4Y4mvLx+hXn/H8WZ7WDpJ/Vz+irfXBIuamn/kG5t6qVdX/3b5AAAAAElFTkSuQmCC>

[image49]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAVCAYAAAAElr0/AAABp0lEQVR4Xu2WO0sEQQyAg6LgoxMrS7ERQUGwEDt/gIV/wM7WWhFErCwFwcLitLFVLARBxEZsRLTWxlcrWCs6cTN7mWyyG+HK+SCQfJnNZTi4W4BMJtPEbohNKf/BoRSClRDHIcZkgzES4iTEomwIPLPgJ8SZlAr9IZZCvELxDIYF9sYpP6Bagu6B8gGqu9vtEs+sktomMRpigfK6i/AFubtk9TI5zrbiPLMSsPksZQ1NFxkS7oZ8xHpeOs+sBGuwhXV+HnS/B9WLvLA6gh6/GcQ7K8FazMI63wLd44+KvMgtqyPo3yhvUS2RsxKsxSys8xeg+zUofB/VmF+32yV8rndWgrWYhXX+HHQfP7yHas9FvLMSrMUsrPM7oPstSD3md6yOoH+i3DsrwVrMwjo/Cbo/gupFPlkdQb9KuXdWAjaupKzBugiCfla4D/IR63npPLNKeqHamCKH/+Ia1iLINwUHz66zeoYc51FxnlkwF2KCGvibzYmvDPvMdZHTQoLuFIpXjq8Q72n7j3sozg2G2KBco3EWLjssZYeZlkIhvkc14ZmVyXSKX6PEr8yukIeuAAAAAElFTkSuQmCC>

[image50]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAVCAYAAAAnzezqAAABPElEQVR4Xu2UMStGcRTGH4mS6c1qMVgslO1drb6BwScgi0lSsuidGGQwMCmT2JSsZrtN2HwB4hz/89dzj5NzKdv91alznvPcp9O9by/Q0VFYkzqXmvaLlmxJ7XmR+DH/XWrG+hOb23KGpv+V+kqaf+dmNdw4LWKAZtiyzauk6ZzmT/Ag3CK4MkA9S067d7N6fp1/iMQgrCD3LCD2pPnbSAwoe61JqSepC5vrt1aOTfOk+RsohjG/IOoBD6Spn4Ov3VxJ86thxC+IeoCH9SvqmTR/B/GDTJsD9qln0vxTJAbhGbGHD5ilnvmW3+dBeEH8IDOK2OPfjPZp/hsPKMtNmudM4x+cotoBzcOm6XEVzc7yP4VLlAD9K33kpTCO4jly+pDpu1Lr1i82HIUs/4t5L7SkJzXlxYC/5nf8Lx8kK22B9cfLsgAAAABJRU5ErkJggg==>

[image51]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAVCAYAAAAnzezqAAABDElEQVR4Xu2QQQsBYRCGp+QgRyc/gIML5ebqD7mjJL9ADpIDJ1flpuTq7DfIVY6KmM/Oanr3s9Nu3Papt915Z+Zt+ogyMgI6rDWrgo0EzFh9NIXY/CerJv9LqdPg9nwHmPlHqN3AHjwLt+M7wHlmfkkXzIE8V8YwYZXp+wGJ86dkDABX+eIBbfEQM39IxoBCz+EBC/EQM79LwUABG0CPVVU1HrATDzHzw4E8NoAb1HjAVjzEzB+Rf1Hj6+MBY/EQM39FxgAF/Tg56upfE8lv6YK5kH/RAl8g9Mz8hy4oGtQQ76Q8H25mAJ7LtvLfxoaVY91ZZ91kihTMzMEPwefH17PyPzTR+DH/zs9IxwtU4GgwMZ7a5AAAAABJRU5ErkJggg==>

[image52]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAVCAYAAAAElr0/AAAB2UlEQVR4Xu2WTStFURSGd0TJR0omTEwMSFHKADP+gfwDZaAw9lGSkaFSBgaMjBQZKCVJyUQiE8XEVymljIn1nrPOtc5797l334HZeeqtvZ517jpn3+7Hdi4nJ6cc65JllgG0S/YlY9wgpiQHkhFuGEJnzUr2JJ3csPxIDllmgGtvdF2vdfVfuwB8la7HtWYqmdWt622tMynZVCZd8XWrHsc1WJDcm7qSWclmrTshVwDNR5YEruEbAXZcgzaX9pXMaiF3od5L1mAL+k8sXezxbtoaaTLuTTJt6pBZ+G75nmnD+X1E6EYuWbrYv5h6VB3yLjmT3Jk+CJm1pTWDHyifjwjdyDlL539th/FIV6obNuvYrC3zLvZ13AC+h2FCbg6aTf2hawQPkBAy68isLclGargB+GF8oH/F0sX+gWoLvqw8P2TWmtbMivP7CL6RD/Q/WbrYz+l6RmsfvJFys3q1Znac30egccqSyNqsdRNUW3gjvuvYoR4kl3xci6h1xY0+dc/GDaiz4E+OHdeg0aV96KxvjQXXLFoxLOnRBp+HkiPDJvlr9Q2SJV0zyUdiVzIkudWaCZkF4HFmw/HlS/KabscP28oykOTsUwqctfDOlyNkFuhnkZPzj/wCkwm5mWC0hYoAAAAASUVORK5CYII=>

[image53]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAZCAYAAAA4/K6pAAAAi0lEQVR4XmNgGAXYwDsg/k8As8BV4wEwxehgDQNEXA9dAh2AFN1GF4QCXIbDQQgDRIEMugQUEDTgHwNuBQcZIHLp6BLIAJ8NIPEf6ILoAKToAxCnMUBsKgXi31BxLyR1WEEwA0ShM7oEsQCf84kCVDHgK7ogsSCTAWKAHboEIfCEAeF0ZDwKRgFRAADsMTCfknqVxAAAAABJRU5ErkJggg==>

[image54]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAZCAYAAAAmNZ4aAAAAnUlEQVR4XmNgGAWjgHjwnwC+iVBKGwCyZDa6IAPCATQBIAtxGV7GAJGrRpegBsDnq2sMELkGNHGqAHwW45OjGIAMnoUuCATJDBA5C3QJGIC5ihDGBiYyQOQKgDgViLOBuAUqhksPSWA+ugAUUM0CXGDALJ6DLgAFIEsPoAtSE0xFFwCCeQwQi9nQJWgNaB7M6AA5pSPjUTAKRsEIAABasjyDKDFcTwAAAABJRU5ErkJggg==>

[image55]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAAAZCAYAAABAb2JNAAACiElEQVR4Xu2YS8hNURTHlzcRCUUoKfIqipAMyFzmZkwUychEJjIxMVAeGTGQgWcZKKUvMzNlJFFSJBQpJXntf3vt7vr+Z+1z97nf1f0G+1er9vr/1350zrnn7H1FKpVKpTIKVoX4q/EhxJi296uP9mTiYogzLBayMsTNEEfZMJwIcT/EGjZK+Snxoi1lI/BDoveRjRFxRMbfYLQfmrwfqL+n7ZmaM9A2aPu65p1IT2cb8DeyOCKwlqmOVgLqblHOfZE/d7Qx0rJ8l+agHiU1g7JQ4vhX2HC4JP5aoL1lkeAnHGwJ8Zg01Cwi7anqfVkusfAXGw5FA3Zkp8RxT7LRgvdkgZxuKanZJ34NbrinNyiZ5H9wWOK86QPYhdyac7ol1bwKcTvEJ80t1xwN4IPo6Q1KFjJMzkmcbz0bHcitOadbUs1co31VLYFXgTfOKYn6HDYsU6RsIcPgjsR5FrAxALk153SLV7NJtbWaP9KcSRd1BhuWxRKL3pDuYSfxJmzjhXTv04Z3YUBOt3g181V7pvkFzZmz4usNvEmY6SEOmbxffY70s8K+cCLk1pzTLV7NPNXSRd2sOYODgqc38CZhko+f8MsQ70Lc7dmdSVuiZWwUgp2Ct2ZoT1gkvkmz7zrVdhgN+S6Tgy+q92WWxEIcxTx4EM4nwjGJ421nowD0w/4y4Z2K0gNjDwl4H3IdHhLWfmtYUHOatCyrpbcAvKSPSzyW4q4yPPkw2Ctx3INstLBCYp/d0vvQYH9pea06c1WifkDiUdWrAdAfhJgmcR//frxdzjYWiNwChgFOMH9Y7AO2RktYLAQ3YzaLDltZGCY3QpzX9mdrVAZnT4jLEv8SrFQqlUqlMpn5B7IGx82+nKsPAAAAAElFTkSuQmCC>

[image56]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAAYCAYAAACr3+4VAAAB20lEQVR4Xu2WPShGURzG/yXKx2b0NUmRj5KB1WqwiEWS0WJQlCxYrFIMBkoZEIVFyaqUwSKbQQaLUfJ5ns45Oe/T/1z37RXL+dVT9zzPuf9z3nPPe88VSSQSiW+mjA6NmjnI4JONDOqNDowmOfhLMOFWd73l2nlAv5hmgn4fRuPuukJs3vQd/w0Y9Frxzslj/IQvjU6NToyOnMKFGjZaDNqeHxfzyeiRzRLAgLXkXTg/i1k2HHzfi9E+eYD7RbkTuyVKoV/0AddF90Pa2RC7QLwlj8XWWgu8BucVBbYYbsJWKpZN0QdcEN3PosrolU0HanlhIYqtXYB/Co0cZHAm+qBzYv1KDjLQ6oSEPxb/65KZFlushwMFvES0CfofWs5BhDbR63iQjRhNuGuvkukVW4hfMsyK6AMuie7HyJo4/FXFy/swVMbEFhjgIEKn6BPcEd2Pgb63bDpideDfsPkT/gm0cJAD3NdHHo6w2AQ10HePTUesDs7ubTZjoDgK1XBQBO9OIag5H7S7nHcfeJ4hsVl4fIQg22VT4gtQwJXk7JgT1MIXTZnRm9FDYSzVYvtskA9GxWbLHAQgx4fDoNgFRLuuoIfCMxu/SDcbOelgIwLeCThvE4lEIvFvfAHQdYI0AH/eUgAAAABJRU5ErkJggg==>

[image57]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAVCAYAAADrVNYBAAAAcElEQVR4Xu3SvQmAUBAD4LMRd3FIx3ANwQlcwsJeW6sHIviTx+viAgbyQZqkOrgIMzP7qRp5kI4HZU2UowYe1OWjFi7VHUjiUt2G3FwqG6O8n7Q5yhEVD0p25ORSzYWsXCrJL5RfaeJBTYv0XJrZxwuunhK87BUmsQAAAABJRU5ErkJggg==>