# **HESTIA: Foundational Intelligence Infrastructure and Memory Architecture for Enterprise Venue Operating Systems**

## **Part 1: Intelligence Infrastructure Foundations & Core Primitives**

### **The Concept of Intelligence Infrastructure in Enterprise Systems**

In the architecture of enterprise-scale artificial intelligence, intelligence infrastructure represents the persistent, governed, and ontologically grounded cognitive layer that underlies all runtime execution1. Unlike early-stage deployments that rely on transient context windows or unstructured search mechanisms, a true intelligence infrastructure functions as the cognitive substrate of an organization1. It translates raw database schemas, event logs, and operational telemetry into a unified semantic map of the business2.  
This layer does not simply retrieve data; it defines the semantic constraints, relationships, policies, and historical context that ground the reasoning patterns of autonomous systems1. For high-stakes, multi-turn physical environments like hospitality venues, this infrastructure is the structural backbone that ensures decisions remain safe, consistent with brand standards, and aligned with operational constraints1.  
To position this model within modern enterprise architectures, the table below distinguishes the seven levels of system integration, demonstrating how each layer builds upon its predecessor.

| System Class | Definition | Architectural Complexity | Operational Scope | Temporal Horizon | Governance Mechanism |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **AI Feature** | A singular, stateless functional capability embedded within an existing system1. | Minimal; utilizes direct API wrappers and basic templates. | Point solution (e.g., summarizing an individual shift log). | Transactional or session-bound. | Hardcoded software exceptions and API rate limits. |
| **AI Assistant** | A conversational interface designed to answer ad-hoc queries and generate content1. | Low to Medium; relies on prompt-based retrieval. | User-centric querying and text generation. | Single session. | System prompts and basic boundary-filtering models. |
| **AI Workflow** | A deterministic sequence of tasks coordinating multiple system calls5. | Medium; uses linear orchestration graphs and direct API pipelines. | Task automation (e.g., scanning feedback and drafting replies)5. | Task-bound. | Process managers and static workflow validation rules. |
| **AI Knowledge Base** | An indexed directory of corporate files accessible via semantic search mechanisms8. | Medium to High; uses vector databases and document parsers3. | Retrieval-augmented generation for informational queries. | Static; updated on schedule. | Document access privileges and data ingestion protocols6. |
| **AI Memory System** | A multi-layered cognitive architecture managing context and state over time3. | High; graph-relational hybrid with decay filters3. | Context retention, fact-versioning, and personalization3. | Multi-session to indefinite3. | Memory consolidation pipelines and decay sweeps3. |
| **AI Intelligence System** | A reasoning engine that compiles memories into active operational interpretations1. | Very High; combines ontological graphs with non-monotonic reasoning1. | Operational diagnostics and identity validation1. | Evolving; structural. | Rule engines and consistency validation policies1. |
| **AI Operating System** | A unified platform managing data pipelines, agent fleets, and execution pathways5. | Extreme; coordinate multiple agents, tools, and security controls5. | Governance, resource allocation, and write-back execution5. | Permanent; multi-generational7. | Cell-level security and cryptographically signed logs4. |

### **Foundational Requirements for Organizational Understanding**

Before an AI system can understand a physical, real-world organization over time, it must move past stateless vector lookups3. A vector database excels at semantic similarity but cannot natively track state transitions, traverse multi-hop relationships, or manage logical contradictions over time3. For HESTIA to understand a hospitality venue, several foundational elements must exist:

* **A Unified Data Processing Backplane**: A data pipeline capable of converting real-time events from point-of-sale (POS) systems, property management systems (PMS), reservation platforms, scheduling tools, and HVAC or kitchen sensors into standardized data objects2.  
* **A Formal Domain Ontology**: A structured, typed vocabulary (e.g., standardizing concepts like *Guest*, *Employee*, *Table*, *Allergen*, and *Transaction*) that translates raw database columns into real-world concepts the system can reason about2.  
* **An Epistemological Division of Memory**: A cognitive pipeline that separates raw historical observations from synthesized logical beliefs, preventing temporary operational adjustments from permanently altering the venue's core brand standards3.

Without these elements, an artificial agent remains blind to the physical constraints, legal limits, and brand standards that define real-world hospitality operations1.

### **The HESTIA Core Intelligence Primitive Framework**

To build a reliable intelligence engine, HESTIA translates raw data streams into structured, typed primitives. Each primitive represents a specific level of belief, tracking its context, origin, and confidence across the system.

#### **1\. Signal**

* **Definition**: A raw, unprocessed event payload ingested directly from a physical or digital source2.  
* **Purpose**: Captures real-time state changes from integrated venue systems2.  
* **Lifecycle**: Ephemeral; ingested by the API gateway, converted to an internal telemetry object, and immediately routed to the verification engine or archived2.  
* **Required Metadata**: Ingestion timestamp, Source ID, payload schema hash, and encryption signature.  
* **Risks**: Network floods, duplicate event payloads, or corrupted system telemetry.  
* **Representation**: A time-series JSON event payload managed in a high-throughput messaging bus like Apache Kafka.

#### **2\. Observation**

* **Definition**: A verified, structured event payload mapped to a recognized entity and timestamp2.  
* **Purpose**: Serves as the basic, objective historical record of a venue occurrence2.  
* **Lifecycle**: Permanent; stored in the time-series transaction log, but decays in operational context value over time3.  
* **Required Metadata**: Entity UUID, transaction timestamp, verifying source ID, and confidence weight2.  
* **Risks**: Sensor errors, missing metadata, or misattribution to an incorrect entity3.  
* **Representation**: A structured row in a relational SQL database with index keys mapped to the core ontology.

#### **3\. Claim**

* **Definition**: An unverified assertion regarding the status, preferences, or behavior of an entity8.  
* **Purpose**: Represents a candidate belief or hypothesis before it is validated by corroborating evidence8.  
* **Lifecycle**: Temporary; exists in a pending state until resolved by evidence or retired by decay3.  
* **Required Metadata**: Target entity ID, assertion predicate, proposed confidence, and supporting source ID8.  
* **Risks**: Unchecked assumptions treated as ground truth, leading to incorrect recommendations8.  
* **Representation**: A semantic RDF triple node flagged with an "unverified" property class.

#### **4\. Evidence**

* **Definition**: Verified observations or physical metrics that corroborate or refute a pending claim2.  
* **Purpose**: Grounding mechanism that validates system beliefs2.  
* **Lifecycle**: Indefinite; remains linked to its corresponding claims to provide a traceable reasoning history2.  
* **Required Metadata**: Evidence ID, source observation ID, alignment direction, and mathematical weight2.  
* **Risks**: Corrupt, outdated, or biased source data skewing the validity of corresponding claims.  
* **Representation**: A weighted, directed edge in a graph database linking an Observation node to a Claim node.

#### **5\. Source**

* **Definition**: The specific hardware sensor, API endpoint, or human operator that generated a signal2.  
* **Purpose**: Establishes the security permissions, reliability, and provenance of ingested data2.  
* **Lifecycle**: Permanent; registered in the system's global integration registry10.  
* **Required Metadata**: Source UUID, security credentials, system type, and historical reliability rating2.  
* **Risks**: Compromised API keys, system downtime, or degrading hardware sensors2.  
* **Representation**: An administrative configuration node in the system's security database6.

#### **6\. Memory Item**

* **Definition**: An indexed unit of knowledge stored in long-term memory3.  
* **Purpose**: Serves as the cognitive substrate for historic and predictive calculations3.  
* **Lifecycle**: Persistent; managed by systematic consolidation, reinforcement, and decay schedules3.  
* **Required Metadata**: Memory ID, classification type, creation date, access clearance, and reinforcement count3.  
* **Risks**: Stale or corrupted memory items polluting active contexts during retrieval3.  
* **Representation**: A composite object linking high-dimensional vector embeddings with relational metadata3.

#### **7\. Entity**

* **Definition**: A distinct physical or conceptual object, person, or location within the venue ontology4.  
* **Purpose**: Standardizes the physical and operational components of a venue4.  
* **Lifecycle**: Long-term; matches the physical lifecycle of the venue's assets or active user rosters6.  
* **Required Metadata**: Entity UUID, semantic class (e.g., Guest, Table, Staff, Ingredient), and property fields12.  
* **Risks**: Duplicate profiles created for the same physical entity3.  
* **Representation**: A central node in an OWL-compliant semantic knowledge graph10.

#### **8\. Relationship**

* **Definition**: A typed, semantic link connecting two or more entities4.  
* **Purpose**: Establishes the operational hierarchies and associations of the venue4.  
* **Lifecycle**: Dynamic; updated or versioned as physical and operational states change4.  
* **Required Metadata**: Link UUID, source entity, target entity, relationship type, and validation status12.  
* **Risks**: Broken references or stale relationships causing logical errors in recommendation loops3.  
* **Representation**: A directed edge in an OWL-compliant semantic knowledge graph10.

#### **9\. Context**

* **Definition**: The active operational frame defining what is relevant during a specific event1.  
* **Purpose**: Directs reasoning search space to protect system performance1.  
* **Lifecycle**: Temporary; created upon task initiation and destroyed upon completion1.  
* **Required Metadata**: Context ID, triggering event, active entity scopes, and active system constraints1.  
* **Risks**: Irrelevant data polluting the active context, degrading performance.  
* **Representation**: A dynamic memory projection compiled in working memory1.

#### **10\. Hypothesis**

* **Definition**: An unproven causal relationship or operational pattern proposed by the system.  
* **Purpose**: Triggers diagnostic tasks and data collection to verify potential operational insights.  
* **Lifecycle**: Temporary; active until proven, refuted, or retired by time limits.  
* **Required Metadata**: Hypothesis ID, target entities, predicted outcomes, and current validation progress.  
* **Risks**: Executing high-risk operations based on unverified, speculative hypotheses.  
* **Representation**: A dynamic evaluation rule loaded into the active reasoning engine.

#### **11\. Assumption**

* **Definition**: A default parameter or belief used to make decisions when data is incomplete9.  
* **Purpose**: Prevents operational bottlenecks by allowing decision loops to proceed with default parameters.  
* **Lifecycle**: Active until displaced by verified claims or signals9.  
* **Required Metadata**: Assumption ID, target parameter, default value, and validation trigger.  
* **Risks**: Unverified assumptions remaining active indefinitely, masking real-world operational changes.  
* **Representation**: A fallback value property flagged with an "assumed" status tag.

#### **12\. Decision**

* **Definition**: A committed state change or operational choice selected from alternative options15.  
* **Purpose**: Registers the system's actions and policies, ensuring accountability and auditability6.  
* **Lifecycle**: Permanent; recorded in an immutable ledger for operational audit trails2.  
* **Required Metadata**: Decision ID, triggering event, selected action, alternatives evaluated, and author2.  
* **Risks**: Committing to unauthorized, high-impact decisions without human approval6.  
* **Representation**: A cryptographically signed record stored in the immutable Decision Ledger.

#### **13\. Recommendation**

* **Definition**: An optimized operational proposal presented to a user2.  
* **Purpose**: Provides actionable guidance to improve venue performance2.  
* **Lifecycle**: Expiring; valid for a specific operational window, after which it is archived.  
* **Required Metadata**: Recommendation ID, reasoning trace, confidence score, and projected operational impact2.  
* **Risks**: Delivering low-value, irrelevant, or operationally disruptive recommendations to staff.  
* **Representation**: A formatted API payload delivered to the user interface.

#### **14\. Action Proposal**

* **Definition**: A programmatic instruction payload targeting an integrated third-party system2.  
* **Purpose**: Bridges cognitive decisions with execution in connected digital systems5.  
* **Lifecycle**: Resolved; progresses from Draft to Pending Approval, then Executing, and finally Completed or Failed.  
* **Required Metadata**: Proposal ID, target system, payload schema, execution timeline, and approval token6.  
* **Risks**: Executing erroneous or dangerous commands in external software (e.g., duplicate orders)6.  
* **Representation**: An orchestration payload managed by an integration runtime.

#### **15\. Human Review**

* **Definition**: A mandatory approval gate that blocks high-risk action proposals2.  
* **Purpose**: Enforces human-in-the-loop oversight for safety and brand compliance6.  
* **Lifecycle**: Active until resolved with an Approved or Rejected decision by an authorized operator6.  
* **Required Metadata**: Review ID, target action proposal, authorized roles, decision status, and review notes.  
* **Risks**: Approval bottlenecks delaying time-critical operational responses6.  
* **Representation**: A stateful task ticket routed through the system's management interface.

#### **16\. Confidence**

* **Definition**: A statistical metric representing the verified reliability of a claim or belief.  
* **Purpose**: Informs execution routing, risk assessments, and user interface displays.  
* **Lifecycle**: Dynamic; continuously updated as new corroborating or refuting evidence is ingested.  
* **Required Metadata**: Metric ID, formula version, source weights, and validation margin.  
* **Risks**: Overconfident calculations due to biased or duplicate source inputs.  
* **Representation**: A real-valued vector value ![][image1] attached to active claims.

#### **17\. Uncertainty**

* **Definition**: A metric representing missing data or conflicting evidence in the knowledge base15.  
* **Purpose**: Triggers active diagnostic queries and restricts automated action loops.  
* **Lifecycle**: Dynamic; recalculates as missing attributes are populated or resolved.  
* **Required Metadata**: Metric ID, gap type (missing properties vs. conflicting assertions), and escalation rules.  
* **Risks**: Failing to flag significant operational gaps, leading to incorrect automated decisions15.  
* **Representation**: A precision variance metric stored alongside claim confidence values.

#### **18\. Contradiction**

* **Definition**: The coexistence of two or more logically incompatible claims in the active workspace3.  
* **Purpose**: Halts automated executions and prompts verification or human review3.  
* **Lifecycle**: Active until resolved by new evidence, decay, or explicit human decision3.  
* **Required Metadata**: Contradiction ID, conflicting claim IDs, logical rule violated, and conflict duration.  
* **Risks**: Ignoring logical conflicts, leading to erratic system behavior3.  
* **Representation**: A typed conflict node in the semantic graph linking the incompatible claims.

#### **19\. Drift**

* **Definition**: A systematic divergence between observed behavior and core brand standards3.  
* **Purpose**: Alerts management to long-term degradation of brand or service standards11.  
* **Lifecycle**: Evaluated over rolling windows, generating alerts when drift thresholds are breached.  
* **Required Metadata**: Drift ID, target standard, observed metric, divergence rating, and trend timeline.  
* **Risks**: Misinterpreting normal seasonal variation as permanent identity drift11.  
* **Representation**: A temporal analysis vector calculated over historical metrics.

#### **20\. Pattern**

* **Definition**: A recurring, statistically significant structure detected across signals and logs9.  
* **Purpose**: Powers predictive scheduling, inventory planning, and training recommendations9.  
* **Lifecycle**: Persistent; stored in semantic memory and updated as new occurrences are logged3.  
* **Required Metadata**: Pattern ID, template graph structure, occurrences, and statistical significance.  
* **Risks**: Identifying spurious correlations as valid operational rules.  
* **Representation**: A compiled sub-graph template indexed in semantic memory3.

#### **21\. Incident**

* **Definition**: A significant operational failure or negative occurrence that disrupts standard operations2.  
* **Purpose**: Initiates high-priority service recovery SOPs and records the breakdown2.  
* **Lifecycle**: Active; transitions from Detected to Mitigating, Mitigated, and finally Post-Analysis2.  
* **Required Metadata**: Incident ID, timestamp, category, affected entities, and mitigation steps taken2.  
* **Risks**: Failing to log incidents, hiding persistent operational failures.  
* **Representation**: A structured event node linked to episodic and operational memory2.

#### **22\. Lesson Learned**

* **Definition**: A generalized rule or SOP adjustment derived from incident post-analyses2.  
* **Purpose**: Modifies future procedural reasoning to prevent recurring failures9.  
* **Lifecycle**: Drafted by the system, verified by management, and integrated into procedural memory6.  
* **Required Metadata**: Lesson ID, source incident ID, rule adjustment proposal, and verification date9.  
* **Risks**: Codifying ineffective or disruptive rules based on isolated incidents9.  
* **Representation**: A parameterized transition rule stored in the procedural layer.

#### **23\. Doctrine Rule**

* **Definition**: A permanent, high-level policy defining the venue's philosophy1.  
* **Purpose**: Constrains all recommendation generation and action pipelines1.  
* **Lifecycle**: Permanent; altered only by explicit owner authority6.  
* **Required Metadata**: Rule ID, constraint definition, creator ID, and modification history.  
* **Risks**: Overly rigid rules choking operational adaptability in dynamic environments.  
* **Representation**: An immutable policy constraint loaded directly into the active reasoning engine1.

## **Part 2: Core Memory Architecture Framework**

To prevent the cognitive category errors common in unstructured vector databases, HESTIA organizes its memory system into specialized cognitive layers3.

### **Multi-Layer Memory Taxonomy**

The table below outlines the sixteen distinct memory layers that form HESTIA's memory architecture.

| Memory Type | What It Stores | Prohibited Data | Access Rights | Persistence Horizon | Confidence Decay Mode | Contradiction Reconciliation | Human Review Trigger | System Connections |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Working** \[cite: 3, 9\] | Active reasoning variables and current context state3. | Long-term facts, raw transactional logs3. | Running system agent, active task thread10. | Session-bound; milliseconds to minutes3. | Instantly dropped upon task completion3. | Terminate active task; fall back to previous state. | System execution errors or unresolvable loops. | Queries Semantic; logs outcomes to Episodic3. |
| **Session** \[cite: 3, 9\] | Conversational variables and transient session data3. | System passwords, database credentials6. | Active user, assigned agent6. | Duration of active session (e.g., 24 hours). | None during session; wiped post-session3. | Latest timestamped session value overrides previous. | Security policy or multi-device login anomalies. | Links to Episodic and Working memory layers3. |
| **Episodic** \[cite: 3, 9\] | Chronological record of discrete operational occurrences3. | Raw customer payment details, unhashed data. | Managers, Admins, assigned Agents6. | Indefinite; archived systematically8. | None; historical logs remain fixed over time. | Maintain both; flag as competing testimonies3. | Conflicting records of high-impact incidents2. | Feeds Semantic consolidation pipelines3. |
| **Semantic** \[cite: 3, 9\] | Consolidated facts, taxonomies, and entity networks3. | Ephemeral transactional states3. | Global read; Admin and GM write6. | Permanent structural storage8. | Decay based on source validation checks3. | Trigger verification workflows; suspend updates3. | Any change to core taxonomy properties6. | Serves as the base terminology for all layers10. |
| **Procedural** \[cite: 8, 9\] | Step-by-step SOPs and service playbooks8. | Subjective user opinions, physical state logs. | Managers, Trainers, execution Agents6. | Permanent until superseded by new SOP versions8. | None; rules remain absolute. | Version tracking; active standard overrides. | Modifying safety, prep, or brand SOP templates6. | Governs actions compiled in Working memory. |
| **Operational** | Real-time status of physical and digital assets. | Historical logs older than rolling window. | Floor Staff, Managers, integrated APIs6. | Rolling 7-day window. | High decay; operational metrics lose utility fast. | Direct sensor telemetry overrides estimated metrics. | Hardware sensor or integration failures. | Linked directly to Working and Episodic layers3. |
| **Founder** | Brand guidelines, philosophy, and decision styles11. | Day-to-day shifting operational complaints. | Owners, Admins6. | Permanent7. | Extremely slow decay; highly protected. | Strict lock; rejects conflicting operational signals1. | Any attempt to override or modify core parameters6. | Constrains Semantic and Procedural memory layers1. |
| **Venue** | Physical layout, equipment inventory, and licenses4. | Staff performance records, third-party logs. | Managers, Admins, Technicians6. | Permanent until physical changes occur4. | None; physical structures are treated as rigid. | Trigger layout or structural mismatch alerts4. | Verification of physical renovations or licenses6. | Establishes spatial boundaries for execution4. |
| **Guest** | Preferences, dietary needs, and order history16. | Private payment details, sensitive data. | Host, Floor Staff, Guest Managers6. | Indefinite; subject to guest deletion requests. | Slowly decays if guest does not return3. | Consolidate duplicate records via fuzzy matching3. | Merging highly active guest profiles6. | Informs service customization in Working memory. |
| **Staff** | Skills inventory, training logs, and performance metrics. | Private personal/health data of employees. | GMs, HR, Owner, Instructors6. | Duration of employment \+ legal retention period. | Performance decay calculated via training intervals. | Manager review overrides automated system logs. | Critical performance drops or disciplinary reviews6. | Linked to Academy and Procedural memory9. |
| **Event** | Historical and planned events metadata, planning constraints6. | Unassociated operational metrics. | Event Planners, GMs, Sales Team6. | Lifecycle of event planning \+ historic archiving. | Event data decays in utility post-event review. | Manual intervention by event manager required. | Budgets, venue safety waivers, layout exceptions6. | Integrates with Venue and Guest layers4. |
| **Academy** | Training modules, lesson materials, testing records, grading logic. | Non-training-related guest or staff data. | Instructors, Students, Managers6. | Permanent curriculum life. | None; academic truth states are non-decaying. | Academic lead resolves curriculum discrepancies. | Certification issuance or curriculum overhaul6. | Connected to Staff memory and Procedural rules. |
| **Decision** | Audit ledger of all system decisions and structural changes2. | Temporary conversational thoughts9. | Read-only to Admins, Auditors, Owners6. | Permanent; immutable audit ledger2. | None; immutable history of records2. | Strictly append-only; updates require correction entries. | System rollbacks or forensic security evaluations6. | Core ledger connecting all active system adjustments2. |
| **Reputation** | Consolidated review metrics, online sentiments, press coverage16. | Unfiltered raw web scrapes. | GMs, Marketing, Owners6. | Indefinite; tracked historically for trends4. | Decay based on freshness; old reviews weight less. | Statistical consolidation using weighted confidence3. | Highly negative, viral, or questionable reviews6. | Feeds operational improvement recommendations2. |
| **Historical** | Aggregated financial and volume metrics of past performance years. | Granular raw session transcript logs3. | Owners, GMs, financial tools6. | Indefinite; long-term analytical store7. | Decays in predictive capacity over rolling eras. | Reconciled against verified bank/POS ledger statements. | Major balance adjustments or structural accounting changes6. | Foundation for forecasting and budgeting algorithms. |
| **Audit** | Security access, API logs, read/write authorizations, system errors2. | Application-level business logic variables. | System Security Admins, external compliance6. | 7 years (regulatory compliance standard). | None; logs are absolute security states2. | Cryptographic verification failure triggers alert. | Unplanned root access or bulk data extraction attempts6. | Monitors and validates all system transactions2. |

### **The Minimum Viable Memory Architecture**

The Minimum Viable Memory Architecture (MVMA) for HESTIA avoids the trap of a single vector database3. While vector databases excel at finding semantically similar text, they cannot handle exact state transitions, multi-hop relationship traversals, or ACID-compliant transaction records3. HESTIA’s MVMA coordinates three integrated storage engines:

\+---------------------------------------------------------------------------------+  
|                                 HESTIA MVMA                                     |  
\+---------------------------------------------------------------------------------+  
|                                                                                 |  
|  \+---------------------------+        \+--------------------------------------+  |  
|  |     Relational Database   |        |          Knowledge Graph             |  |  
|  |     (PostgreSQL State)    |        |        (Neo4j Semantic Graph)        |  |  
|  \+-------------+-------------+        \+------------------+-------------------+  |  
|                |                                         |                      |  
|                |              \+-------------------+      |                      |  
|                \+-------------\>|   Active Context  |\<-----+                      |  
|                               |     Workspace     |                             |  
|                \+-------------\>|  (Working Memory) |\<-----+                      |  
|                |              \+-------------------+      |                      |  
|                |                                         |                      |  
|  \+-------------+-------------+                  \+--------+-------------+        |  
|  |       Vector Engine       |                  |    Immutable Ledger  |        |  
|  |     (pgvector/Qdrant)     |                  |   (Append-Only Logs) |        |  
|  \+---------------------------+                  \+----------------------+        |  
|                                                                                 |  
\+---------------------------------------------------------------------------------+

* **The Transactional Relational Database (PostgreSQL)**: Handles the real-time operational state of the venue3. This engine tracks active shift staff rosters, table bookings, and current task lists, providing strict ACID guarantees3.  
* **The Semantic Knowledge Graph (Neo4j)**: Maps business concepts as typed nodes and relationships3. This database stores the venue ontology, physical layouts, recipe structures, and procedural guidelines, allowing the system to execute multi-hop reasoning (e.g., matching a guest's allergen profile to dynamic kitchen inventory)3.  
* **The Vector Engine (pgvector/Qdrant)**: Indexes semantic embeddings of the episodic and reputation layers3. This engine allows the system to find experiences or reviews that match a current operational situation3.  
* **The Immutable Ledger**: A secure, write-once log that records all automated decisions, overrides, and security events, creating a tamper-proof audit trail2.

When a signal is received (e.g., a guest checking in), the **Working Memory** queries PostgreSQL for active reservation state, Neo4j for the guest's profile relationships, and the Vector Engine for past service notes1.

## **Part 3: Generic vs. Venue-Specific Knowledge Framework**

To support multiple venues without data leakage, HESTIA maintains strict separation between generic industry knowledge, tenant-level data, and venue-specific operational parameters5.

\+---------------------------------------------------------------------------------+  
|                          HESTIA KNOWLEDGE ARCHITECTURE                          |  
\+---------------------------------------------------------------------------------+  
|                                                                                 |  
|  \+---------------------------------------------------------------------------+  |  
|  |                        Global Core (Read-Only)                            |  |  
|  |       (Standard Cocktails, Menu Engineering Rules, Basic Service SOPs)    |  |  
|  \+-------------------------------------+-------------------------------------+  |  
|                                        |                                        |  
|                                        v                                        |  
|  \+---------------------------------------------------------------------------+  |  
|  |                         Tenant-Specific Layer                             |  |  
|  |        (Enterprise Group Standards, Procurement Rules, Shared SOPs)       |  |  
|  \+-------------------------------------+-------------------------------------+  |  
|                                        |                                        |  
|                                        v                                        |  
|  \+---------------------------------------------------------------------------+  |  
|  |                         Venue-Specific Layer                              |  |  
|  |           (Floor Layout, Specific Menu Items, Local Staff Roster)         |  |  
|  \+-------------------------------------+-------------------------------------+  |  
|                                        |                                        |  
|                                        v                                        |  
|  \+---------------------------------------------------------------------------+  |  
|  |                          Role-Specific Filter                             |  |  
|  |         (F\&B Director Analytics vs. Line Cook Prep Checklist Views)       |  |  
|  \+-------------------------------------+-------------------------------------+  |  
|                                        |                                        |  
|                                        v                                        |  
|  \+---------------------------------------------------------------------------+  |  
|  |                    Session-Specific Context (Transient)                   |  |  
|  |               (Active Table State, Temporary Kitchen Backlogs)            |  |  
|  \+---------------------------------------------------------------------------+  |  
|                                                                                 |  
\+---------------------------------------------------------------------------------+

### **Knowledge Scopes and Boundaries**

1. **Global Core**: Contains universal industry truths shared across all venues18. This includes classic recipe formulas, core menu engineering formulas, standard food safety regulations, and basic service pacing playbooks18.  
2. **Tenant-Specific Layer**: Contains parameters unique to an enterprise hospitality group6. This includes corporate supplier agreements, standardized brand standards, and group-wide HR policies6.  
3. **Venue-Specific Layer**: Contains data unique to a single physical venue4. This includes exact floor layout coordinates, active menu pricing, local staff schedules, and the physical capacity limits of the venue4.  
4. **Role-Specific Filter**: Controls visibility and execution rights based on staff roles6. While a F\&B Director has full visibility over margins, supplier costs, and labor metrics, a Line Cook is shown only prioritized prep check-lists, allergen warnings, and standardized recipe cards6.  
5. **Session-Specific Context**: Maintains the active, real-time status of a live service thread1. This includes active table seatings, current meal orders, and immediate kitchen prep backlogs1.  
6. **Explicit Confirmation Boundaries**: Defines high-impact actions that require manual approval before execution (e.g., updating menu prices or editing allergen warning labels)6.

### **Multi-Tenant Isolation Model**

To prevent knowledge contamination, HESTIA relies on a strict multi-tenant isolation model at the database layer5:

* **Relational Isolation**: PostgreSQL tables enforce Row-Level Security (RLS) policies6. Every query automatically appends a cryptographically verified tenant\_id and venue\_id filter6.  
* **Graph Isolation**: The knowledge graph utilizes partitioned graph namespaces5. The global core is projected as a read-only base layer, while tenant and venue data are isolated overlay networks accessible only by users with matching security keys1.  
* **Vector Isolation**: Vector similarity searches enforce metadata pre-filtering3:  
  ![][image2]  
  This ensures an agent can never retrieve semantic memories belonging to another tenant or branch3.

## **Part 4: Venue Memory Foundation Framework**

**Venue Memory** is the structured archive of raw, objective events, observations, and declarations3. It does not interpret data; it stores raw records, leaving strategic evaluations to the **Venue Intelligence** layer3.

### **Raw and Semi-Structured Memory Categories**

| Memory Category | Primary Data Type | Dynamic Source | Confidence Level | Freshness Threshold | Sensitivity | Access Rights | Verification Logic | Relation to Intelligence | Relation to DNA |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Founder Statements** | Unstructured text transcript | Strategic interviews, surveys11 | High (![][image3]) | ![][image4] | High | Owner, Admin6 | Signed off by founder6. | Maps core values to logic filters1. | Sets baseline brand standards11. |
| **Venue Facts** \[cite: 4\] | Schema objects | Layout templates, licenses4 | Absolute (![][image5]) | ![][image6] | Low | GMs, Admin6 | Verified by architect review4. | Sets physical limits for pacing and seating4. | Anchors spatial identity guidelines4. |
| **Operational Observations** \[cite: 2\] | Event logs | POS, reservation APIs, sensors2 | High (![][image7]) | ![][image8] | Low | Floor Staff, GM6 | Corroborated with multi-system logs2. | Calculates active bottlenecks1. | Tracks temporary operational shifts11. |
| **Guest Feedback** \[cite: 16\] | Natural language strings | Review platforms, host surveys16 | Medium (![][image9]) | ![][image10] | Medium | GM, Host6 | Reconciled against reservation tables16. | Identifies trends in guest satisfaction1. | Measures delivery of the brand promise11. |
| **Menu Data** \[cite: 17\] | Schema objects | POS card database, menus17 | Absolute (![][image5]) | Real-time | Low | Chefs, GMs6 | Direct POS sync validation17. | Inputs for menu matrix calculations17. | Expresses current culinary style11. |
| **Beverage Data** | Schema objects | Cellar inventory, drink spec files | Absolute (![][image5]) | Real-time | Low | Bar Manager, GMs6 | Confirmed with standard recipes. | Inputs for drink inventory planning21. | Expresses the venue's beverage identity11. |
| **Service Notes** | Semi-structured text | Dynamic shift summaries2 | Medium (![][image11]) | ![][image12] | Medium | Floor Staff, GM6 | Verified by active service lead2. | Flags training opportunities1. | Tracks service alignment11. |
| **Staff Notes** | Semi-structured text | Performance reports, tip logs | High (![][image13]) | ![][image14] | High | GM, HR6 | Validated with timesheet inputs. | Evaluates scheduling and training needs1. | Reflects staff execution quality11. |
| **Event History** | Relational records | Booking platforms, floor layouts6 | Absolute (![][image5]) | ![][image10] | Medium | Event Manager, GMs6 | Post-event audit report. | Used for planning upcoming events1. | Tracks event standards11. |
| **Incident Reports** | Structured schemas | Incident forms, security logs2 | High (![][image7]) | Indefinite | High | GMs, Owner, Legal6 | Verified by floor lead and video footage. | Triggers service recovery workflows2. | Pinpoints risk patterns1. |
| **Shift Reports** | Unstructured prose | End-of-shift reports2 | Medium (![][image15]) | ![][image12] | Low | GMs, Owner6 | Submitted by active duty manager2. | Aggregated to detect long-term trends9. | Identifies service drift11. |
| **Reputation Signals** \[cite: 16\] | Scraped payloads | Google, Yelp reviews16 | Medium (![][image9]) | ![][image12] | Low | GM, PR Specialist6 | Reconciled against reservation database. | Prompts review recovery flows2. | Measures brand public perception11. |
| **Training Outcomes** | Structured logs | LMS databases, practical tests | Absolute (![][image5]) | ![][image10] | Low | Trainers, GMs6 | Proctored system validation. | Maps staff capability to task difficulty1. | Ensures skills support service standards11. |
| **Financial Signals** | Relational ledgers | Accounting, POS daily registers | Absolute (![][image5]) | ![][image12] | High | Owner, GM, CFO6 | Bank reconciliation checks. | Inputs for pricing optimization models21. | Measures financial health. |
| **Supplier Constraints** | Schema objects | Supplier lists, inventory portals | High (![][image7]) | ![][image14] | Low | F\&B Director, Chefs6 | Confirmed with delivery logs. | Alerts to ingredient shortage risks18. | Shapes menu boundaries18. |
| **Spatial Constraints** | CAD vectors | Spatial layout blueprints4 | Absolute (![][image5]) | Indefinite | Low | GMs, Architect6 | Confirmed by structural survey. | Powers seating engine4. | Restricts table seating maps4. |
| **Policy Constraints** \[cite: 1\] | Boolean rules | Legal codes, labor agreements1 | Absolute (![][image5]) | ![][image16] | Low | Owner, Legal6 | Double-checked by legal team. | Blocks scheduling or labor compliance violations. | Enforces legal guardrails. |
| **Kosher/Dietary Rules** | Schema objects | Ingredient lists, medical profiles | Absolute (![][image5]) | Real-time | High | Kitchen Lead, GM6 | Double-verified by executive chef18. | Restricts menu ordering paths16. | Protects guest safety standards. |
| **Concept Design** | Unstructured prose | Brand guides, design profiles11 | High (![][image7]) | ![][image6] | Medium | Owner, GM6 | Signed off by design lead. | Constrains conversational replies. | Defines aesthetic values11. |
| **Historical Changes** | Temporal logs | System database logs | Absolute (![][image5]) | Real-time | High | Owner, Admin6 | Cryptographic check. | Validates evolution of operational models. | Ledger of brand standard changes11. |

### **The Ingestion Ledger vs. The Proposition Layer**

To preserve objective data without committing to early conclusions, HESTIA relies on a strict distinction in its database structures8:

Raw Telemetry Event Ingested (Append-Only time-series log)  
    │  
    ▼  
  Proposition Assembly (Generate unverified candidate claims)  
    │  
    ├─── Insufficient Corroborating Signals ──► Retain as pending claim (Subject to decay)  
    │  
    └─── Sufficient Corroborating Signals ────► Merge into Consolidated Semantic Graph

* **The Ingestion Ledger**: Store observations, transactions, and event telemetry as unalterable data in an append-only time-series ledger2. An entry might read: Guest\_451 ordered Beverage\_12 (Negroni) at 21:14:00; feedback log: 'The cocktail tasted unpleasantly bitter'3.  
* **The Proposition Layer**: When retrieved, raw log strings are mapped to dynamic claims containing confidence ratings and evidence links3. The claim "Negroni is too bitter for Guest\_451" is not stored as an absolute fact; it is calculated dynamically based on current evidence, ensuring a single guest complaint does not immediately alter the venue's master recipe definitions3.

## **Part 5: Venue Intelligence Reasoning Framework**

**Venue Intelligence** is the synthesis layer that processes raw Venue Memory records into active operational insights, transforming historical data into predictive suggestions3.

### **The Operational Reasoning Model**

\+---------------------------------------------------------------------------------+  
|                       HESTIA REASONING ARCHITECTURE                             |  
\+---------------------------------------------------------------------------------+  
|                                                                                 |  
|                        \+---------------------------+                            |  
|                        |    Raw Ingestion Ledger   |                            |  
|                        \+-------------+-------------+                            |  
|                                      |                                          |  
|                                      v                                          |  
|                        \+---------------------------+                            |  
|                        |    Observation Stream     |                            |  
|                        \+-------------+-------------+                            |  
|                                      |                                          |  
|                                      v                                          |  
|                        \+---------------------------+                            |  
|                        |   Proposition Assembly    |                            |  
|                        \+-------------+-------------+                            |  
|                                      |                                          |  
|                                      v                                          |  
|                        \+---------------------------+                            |  
|                        |   Consolidation Engine    |                            |  
|                        \+-------------+-------------+                            |  
|                                      |                                          |  
|                                      v                                          |  
|                        \+---------------------------+                            |  
|                        |  Non-Monotonic Reasoner   |                             |  
|                        \+-------------+-------------+                            |  
|                                      |                                          |  
|                      \+---------------+---------------+                          |  
|                      |                               |                          |  
|                      v                               v                          |  
|         \+-------------------------+     \+-------------------------+             |  
|         |     Active Context      |     |    Action Generation    |             |  
|         \+-------------------------+     \+-------------------------+             |  
|                                                                                 |  
\+---------------------------------------------------------------------------------+

HESTIA transforms raw records into structural patterns using non-monotonic reasoning:

1. **Proposition Assembly**: Ingestion pipelines scan raw events, grouping occurrences into unverified claims2.  
2. **Consolidation Engine**: As candidate claims gather supporting evidence, they pass consolidation filters to prevent minor variances from skewing long-term profiles3.  
3. **Non-Monotonic Reasoner**: Dynamic assertions are evaluated against current rules10. If a new, highly verified observation contradicts a previous assumption, the system updates its active beliefs without needing a full database rebuild3.

### **Transition Logic and Validation Rules**

To prevent false classifications, HESTIA relies on mathematical thresholds to transition claims from raw signals to recognized operational patterns:

                  Unconsolidated Signals  
                            │  
              Does frequency exceed threshold?  
             (N\_events \>= N\_threshold in Window)  
                            │  
         ┌──────────────────┴──────────────────┐  
         ▼                                     ▼  
        Yes                                   No  
(Promote to Candidate Pattern)         (Retain as Individual Observations)

#### **Triggering a Pattern Verification**

The transition from independent observations to a confirmed pattern (e.g., identifying a service delay bottleneck) requires satisfying the following:  
![][image17]  
where ![][image18] is the count of corroborated incidents, ![][image19] is the validation threshold, and ![][image20] is the individual signal confidence.

#### **Flagging Identity Drift**

Identity drift is flagged when observed behaviors consistently diverge from the venue's core design standards11:  
![][image21]  
where ![][image22] represents temporal decay weights, giving higher importance to recent observations, and ![][image23] is the drift tolerance limit.

#### **Detecting Founder Vision Conflicts**

A conflict is flagged when an action proposal or operational policy violates a logic path in the Founder layer1:  
![][image24]

#### **High Uncertainty and Low Confidence Halts**

When a calculation yields high uncertainty, the system halts execution:  
![][image25]  
This suspends recommendations and initiates diagnostic tasks (e.g., instructing staff to confirm a cellar inventory level)15.

#### **Initiating Mandatory Human Review**

A manual approval is triggered whenever:  
![][image26]  
where ![][image27] is calculated based on potential financial loss, guest impact, or safety violations6.

## **Part 6: Venue DNA Foundation Framework**

**Venue DNA** represents the core, stable identity, brand standards, and philosophical boundaries of the venue11. It acts as a set of logical constraints that govern how the system generates suggestions and executes actions1.

\+---------------------------------------------------------------------------------+  
|                         VENUE DNA LIFECYCLE MODEL                               |  
\+---------------------------------------------------------------------------------+  
|                                                                                 |  
|                        \+---------------------------+                            |  
|                        |        Onboarding         |                            |  
|                        \+-------------+-------------+                            |  
|                                      |                                          |  
|                                      v                                          |  
|                        \+---------------------------+                            |  
|                        |       Enshrinement        |                            |  
|                        \+-------------+-------------+                            |  
|                                      |                                          |  
|                                      v                                          |  
|                        \+---------------------------+                            |  
|                        |    Active Constraint      |                            |  
|                        \+------+--------------+-----+                            |  
|                               |              |                                  |  
|                               v              v                                  |  
|               \+------------------+        \+------------------+                  |  
|               |  Operational     |        |   Observation    |                  |  
|               |  Validation      |        |     Ingestion    |                  |  
|               \+--------+---------+        \+--------+---------+                  |  
|                        |                           |                            |  
|                        v                           v                            |  
|               \+--------------------------------------+                          |  
|               |       Drift Detection Engine         |                          |  
|               \+----------------+---------------------+                          |  
|                                |                                                |  
|                                v                                                |  
|               \+--------------------------------------+                          |  
|               |       Planned Review / Revision      |                          |  
|               \+--------------------------------------+                          |  
|                                                                                 |  
\+---------------------------------------------------------------------------------+

### **Stable DNA vs. Evolving Interpretation**

An intelligence system must distinguish its core philosophy from temporary operational adjustments to avoid treating seasonal noise as changes to the brand's identity11.

                Raw Performance Deviations  
                            │  
               Is variance seasonal or temporary?  
               (E.g., summer staffing shortage)  
                            │  
         ┌──────────────────┴──────────────────┐  
         ▼                                     ▼  
        Yes                                   No  
(Temporary Noise)                     (Potential Drift)  
\* Flag as active constraint.          \* Initiate Identity Drift Alert.  
\* Do not adjust DNA baselines.        \* Flag for strategic human review.

* **Stable DNA**: Core rules that rarely change11:  
  * *Hospitality philosophy*: "We do not rush guest turnarounds; guest dining comfort takes priority over seating volume."  
  * *Culinary identity*: "Only organic, locally sourced produce is permitted in the kitchen."  
* **Evolving Interpretation**: Adaptive strategies that respond to seasonal or market changes11:  
  * *Current priorities*: "Reduce food waste by 12% over the next quarter."  
  * *Temporary staffing limits*: "Operating with 2 fewer floor staff due to local shortages; adjusting pacing workflows accordingly."

### **Identity Drift and Historical DNA Changes**

If HESTIA notices the service team is seating guests faster to handle high weekend demand, it compares these observations against the core DNA rule: "Prioritize guest comfort over volume"11.  
If the variance is temporary (e.g., during a single holiday weekend), the system flags the issue as a temporary operational constraint rather than modifying the underlying DNA baseline11. However, if the behavior continues for more than 14 consecutive shifts, the system triggers an **Identity Drift Alert**, prompting the owner to either enforce the original service standards or explicitly update the core DNA records6.  
When DNA parameters are updated, the old rules are archived in the **Historical Memory** layer with clear timestamps, reason codes, and approval signatures, preserving an evolution ledger of the brand's identity4.

## **Part 7: Founder Memory & Founder Digital Twin Framework**

To align recommendations with the creator's vision, HESTIA models the owner's distinct communication style, values, and decision preferences in a dedicated **Founder Memory** sub-system6.

\+---------------------------------------------------------------------------------+  
|                       FOUNDER TWIN COGNITIVE PIPELINE                           |  
\+---------------------------------------------------------------------------------+  
|                                                                                 |  
|                        \+---------------------------+                            |  
|                        |    Raw Founder Input      |                            |  
|                        \+-------------+-------------+                            |  
|                                      |                                          |  
|                                      v                                          |  
|                        \+---------------------------+                            |  
|                        |   Linguistic Extraction   |                            |  
|                        \+-------------+-------------+                            |  
|                                      |                                          |  
|                                      v                                          |  
|                        \+---------------------------+                            |  
|                        |    Consolidation Audit    |                            |  
|                        \+-------------+-------------+                            |  
|                                      |                                          |  
|                                      v                                          |  
|                        \+---------------------------+                            |  
|                        |      Policy Compiler      |                            |  
|                        \+------+--------------+-----+                            |  
|                               |              |                                  |  
|                               v              v                                  |  
|               \+------------------+        \+------------------+                  |  
|               |  Stable Memory   |        |   Exploratory    |                  |  
|               |     Enclave      |        |     Hypothesis   |                  |  
|               \+------------------+        \+------------------+                  |  
|                                                                                 |  
\+---------------------------------------------------------------------------------+

### **Cognitive Modeling of Founder Intent**

Founder Memory uses a structured schema to organize the owner's strategic intent:

* **Founder Vision**: The target brand positioning (e.g., "Establish the premier premium mezcal destination in the region").  
* **Founder Values**: Fundamental ethical boundaries and practices (e.g., "Sustainably support micro-distilleries with fair-trade pricing").  
* **Founder Fears**: High-risk scenarios the system must avoid (e.g., "Negative feedback regarding pretentious or aloof table service").  
* **Founder Priorities**: Operational areas to favor when resources are tight (e.g., "Prioritize cocktail ingredient quality over marketing spend").  
* **Founder Taste**: Aesthetic and stylistic preferences (e.g., "Favor minimal geometric menu layouts over vintage designs").  
* **Founder Decision Style**: How the owner prefers to interact with proposals (e.g., "Provide exhaustive comparative data for financial decisions; use quick approval alerts for operational tasks").  
* **Founder Risk Tolerance**: Acceptable margins for business experimentation (e.g., "Comfortable with menu experiments up to 15% of offerings; conservative on pricing adjustments").

### **Stability Classification of Founder Beliefs**

The system processes founder statements through an evaluation pipeline to classify beliefs by their stability and permanence:

                      Raw Onboarding Transcripts  
                                  │  
                  Has assertion been repeated across  
                       multiple context prompts?  
                                  │  
         ┌────────────────────────┴────────────────────────┐  
         ▼                                                 ▼  
        Yes                                               No  
(Stable Founder Belief)                       (Exploratory Hypothesis)  
\* Write to Core Founder Enclave.              \* Flag as temporary hypothesis.  
\* Generate passive evaluation rules.          \* Require explicit confirmation  
                                                before acting on the belief.

* **Stable Founder Memory**: Core assertions repeated across multiple onboarding interviews or explicit declarations (e.g., "We will never offer discount coupons"). These are written to the core Founder Enclave and generate passive validation rules6.  
* **Temporary / Exploratory States**: Ideas mentioned in passing (e.g., "Maybe we should try a brunch service sometime"). These are flagged as temporary hypotheses, requiring explicit verification before triggering any procedural changes.

### **The Founder Digital Twin Core**

The **Founder Digital Twin** does not attempt to chat like the founder; instead, it compiles the founder's beliefs into operational policy constraints1. When a domain module proposes a change (e.g., recommending a price increase to offset rising ingredient costs), the Twin evaluates the suggestion against the compiled risk limits and communication rules1.  
If a proposal conflicts with the founder's preferences, the system drafts a comparative analysis explaining the variance, allowing the owner to make an informed decision based on their established style1.

## **Part 8: Confidence, Evidence, & Uncertainty Framework**

To prevent false assumptions, HESTIA tracks evidence weights and quantifies uncertainty across all cognitive layers15.

### **The Mathematical Calibration of Trust**

The system evaluates trust and confidence using dynamic equations that account for source reliability, corroborating evidence, and temporal decay:

#### **Calculating Claims Confidence**

![][image28]  
where ![][image29] represents evidence weight, ![][image30] is the reliability score of the source2, ![][image31] is the alignment coefficient across distinct channels, ![][image32] is the source balance weight, and ![][image33] is the temporal freshness decay factor.

#### **Temporal Confidence Decay**

Information degrades over time as operational realities shift, calculated using an exponential decay model:  
![][image34]  
where ![][image35] is the decay constant assigned to the specific memory class, ![][image36] is the current epoch, and ![][image37] is the ingestion epoch3.

   Confidence Level  
    1.0 ┼─────────┐  
        │         └───────────┐  
    0.5 │                     └───────────┐  \<-- Decay curve over time (t \- t\_0)  
        │                                 └───────────  
    0.0 ┼─────────────────────────────────────────────  
        0d       7d          30d         90d         180d

#### **Contradiction Reconciliation Adjustments**

When two highly confident claims contradict each other, the confidence of both is adjusted to reflect the conflict3:  
![][image38]  
This forces the system to halt automatic actions and request human review to resolve the ambiguity3.

### **Architectural Integration of Uncertainty**

HESTIA uses three confidence categories to determine its operational behavior:

* **High Confidence (![][image39])**: The system runs automated background workflows, logging executions in the decision ledger with minimal human oversight6.  
* **Medium Confidence (![][image40])**: The system drafts action proposals and alerts managers, requiring explicit human approval before execution6.  
* **Low Confidence (![][image41])**: The system halts executions, runs diagnostic checks to collect missing data, and escalates the issue if the ambiguity cannot be resolved.

To avoid false confidence, the UI displays these values clearly, showing the specific evidence pieces, the decay levels, and any conflicting data points, ensuring operators understand the reasoning behind every suggestion2.

## **Part 9: Human Review & Decision Rights Framework**

The **Human Review and Decision Rights Infrastructure** controls the execution boundaries of the AI, establishing a strict governance model that balances automation with human authority6.

                                  Action Payload  
                                        │  
                           Evaluate target risk level  
                                        │  
             ┌──────────────────────────┼──────────────────────────┐  
             ▼                          ▼                          ▼  
          Low Risk                 Medium Risk                 High Risk  
       (Auto-Log)               (Draft Proposal)             (Strict Halt)  
\* Execute background task.      \* Notify staff/manager.      \* Present comparative analysis.  
\* Log to immutable ledger.      \* Require manual sign-off.   \* Require direct owner approval.

### **The Operations Decision Rights Matrix**

| Operations Category | Autonomous Execution Bounds (AI Auto-runs) | AI Proposal Bounds (AI Drafts) | Prohibited Actions (AI Never Decides) | Authorized Reviewer | Audit Logging Level | Reversibility Plan |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Venue DNA Updates** \[cite: 11\] | None (Strictly read-only)6. | Proposal of brand DNA shifts11. | Overriding baseline identity standards6. | Venue Owner / Founder6 | High (Immutable signature)6. | Hard recovery; database rollback required6. |
| **Founder Memory Updates** | None. | Draft adjustments from onboarding transcripts11. | Direct modifications to core constraints1. | Venue Owner6 | High (Immutable signature). | Reversible through manual enshrinement dashboard. |
| **Guest Profile Merges** | Fuzzy merge of low-impact duplicates3. | Merging complex guest history records3. | Merging profiles with conflicting allergen declarations. | Hostess, GM6 | Medium (System log). | Reversible via administrative "split profile" workflow. |
| **Staff Performance Alerts** | None. | drafting training requirements9. | Terminating or disciplining personnel based on AI logs. | General Manager, HR6 | High (Personal records lock). | Reversible via manual override of staff records. |
| **Menu Strategy & Rework** \[cite: 17\] | None. | Identifying "Plow Horse" recipe cost updates19. | Deleting core signature menu offerings11. | Executive Chef, F\&B Director6 | High (Standard ledger entry). | Menu version rollback inside the semantic graph4. |
| **Pricing Optimization** | None. | Recommending minor cost adjustments within 5% margins22. | Implementing broad, high-margin dynamic pricing changes. | GM, Owner6 | High (Financial record). | Immediate price reset execution through POS sync. |
| **Event Operational Flow** | Confirming standard table plans4. | Proposing security or staffing adjustments6. | Exceeding physical occupancy safety codes4. | Event Manager6 | Medium (Event diary). | Spatial adjustment reload inside the CAD engine4. |
| **Reputation Outreach** \[cite: 16\] | None. | Drafting personalized replies to 4-star and 5-star reviews6. | Publishing automated responses to negative reviews6. | GM, PR Specialist6 | Medium (Review log). | Manual deletion or editing of responses on public channels. |
| **Academy Certifications** | Generating grading summaries. | Proposing curriculum adjustments6. | Granting formal professional certifications. | Academy Lead Instructor6 | High (Regulatory ledger). | Certificate revocation and student record adjustment. |
| **Purchase Ordering** | Drafting purchase orders for standard ingredients2. | Proposing alternate supplier contracts. | Executing unapproved financial commitments over $1,000. | GM, Chef6 | High (Financial ledger). | Order cancellation request trigger to supplier. |

Every automated execution, recommendation rejection, and manual override is recorded in the immutable **Decision Memory** ledger2. If an operator rejects a system recommendation (e.g., dismissing a proposed beverage cost adjustment), the system prompts them for a brief reason code, capturing valuable feedback to refine its future operational evaluations2.

## **Part 10: Role-Based Intelligence Access Framework**

To protect sensitive corporate information and guest privacy, HESTIA relies on a granular Role-Based Access Control (RBAC) model6.

### **Role-Based Access Control Matrix**

This matrix governs data visibility and execution rights across all system layers6:

| Role | Memory Layer Read Scope | Memory Layer Write Scope | Intelligence Access Bounds | Recommendation Approval Scope | Action Execution Boundaries | Anonymization and Aggregation Filters |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Owner / Founder** \[cite: 6\] | Unrestricted access across all sixteen layers6. | Unrestricted across all sixteen layers6. | Complete access to drift, analytics, and strategy layers1. | Global approval across all modules. | Direct command overrides across all systems. | Raw, unmasked financial and identity data6. |
| **System Admin** \[cite: 6\] | Relational states, schemas, system logs, security audit logs6. | Relational tables, schemas, permissions metadata6. | System health and diagnostic indexes2. | Infrastructure-level system adjustments10. | System-level maintenance and rollbacks10. | Full masking of guest identities and financial margins. |
| **General Manager** \[cite: 6\] | All layers except raw system logs and direct founder parameters6. | Service, operational, staff, reservation, reputation logs6. | Operational performance trends and bottleneck insights1. | Venue-level scheduling, ordering, and pricing tasks. | Venue-level scheduling, ordering, and staff roster updates. | Decoupled view of personal staff data. |
| **F\&B Director** \[cite: 6\] | Semantic, menu, beverage, financial, supplier logs6. | Menu, beverage, recipe formulation files6. | Margin analyses and supply chain performance21. | Ingredient pricing, inventory, and menu changes17. | POS menu card updates and supplier order approvals. | Masked employee payroll records. |
| **Bar Manager** \[cite: 6\] | Beverage, menu, bar staff, inventory logs. | Beverage recipe configurations, cellar logs. | Beverage cost analysis and bar performance trends. | Drink pricing adjustments, bar orders. | Daily bar ordering and cellar stock adjustments. | Aggregated labor cost logs. |
| **Service Manager** \[cite: 6\] | Guest history, service notes, floor layouts, shift schedules6. | Service notes, table mappings, shift logs6. | Service pacing and shift feedback metrics1. | Guest seatings and shift schedule changes. | Dynamic seating allocations and task dispatches. | Masked financial data; raw guest histories6. |
| **Event Manager** \[cite: 6\] | Event diaries, guest details, spatial layouts, event files6. | Event plans, venue bookings, layout variations6. | Event profitability and timeline projections1. | Event-specific pricing and resource layouts. | Booking confirmations and event staff rosters. | Masked global database records. |
| **Academy Lead** \[cite: 6\] | Academy curriculums, student tests, training files. | Curriculum modules, grading parameters, quiz answers. | Staff training efficiency and skill metrics1. | Staff certifications and training modules. | Certification path configurations. | Masked guest records and operational data. |
| **Line Employee** \[cite: 6\] | Assigned schedules, personal tasks, SOP files6. | Individual task completions, shift reports6. | Task checklists and active recipe cards. | None. | Personal checklist and task completions2. | Masked financial, strategic, and corporate data. |
| **External Consultant** \[cite: 6\] | Aggregated performance indexes, menu designs, system reviews6. | None. | System-level operational performance metrics1. | None. | None. | Mandatory masking of guest PII and personal staff profiles6. |

### **Cell-Level Security in Knowledge Retrieval**

Security in the knowledge graph is enforced during query compilation:

           Target Ontological Search Query  
                         │  
             Get active User Role Tokens  
                         │  
             Compile graph security filters  
                         │  
       ┌─────────────────┴─────────────────┐  
       ▼                                   ▼  
Role has clearance?               Role lacks clearance?  
\* Return full target nodes.       \* Redact sensitive attributes.  
                                  \* Mask fields in real-time.

If an external consultant runs an evaluation query over the menu's performance, the security layer intercepts the request, returning the recipe structures while masking sensitive supplier costs and proprietary brand formulas6.

## **Part 11: Domain Intelligence Module Framework**

Rather than running as independent tools, HESTIA's domain intelligence modules are integrated via a shared semantic backplane, ensuring they all contribute to and draw from a unified model of the venue1.

\+---------------------------------------------------------------------------------+  
|                         HESTIA DOMAIN COORDINATION                              |  
\+---------------------------------------------------------------------------------+  
|                                                                                 |  
|  \+---------------------------+        \+--------------------------------------+  |  
|  |    Beverage Module        |        |          Culinary Module             |  |  
|  |  (Cells, Recipes, Pours)  |        |    (Prep Times, Margins, Waste)      |  |  
|  \+-------------+-------------+        \+------------------+-------------------+  |  
|                |                                         |                      |  
|                |              \+-------------------+      |                      |  
|                \+-------------\>|   Unified Venue   |\<-----+                      |  
|                               |  Semantic Graph   |                             |  
|                \+-------------\>| (Common Ontologies) \<----+                      |  
|                |              \+-------------------+      |                      |  
|                |                                         |                      |  
|  \+-------------+-------------+                  \+--------+-------------+        |  
|  |     Service Module        |                  |      Event Module            |  |  
|  | (SOPs, Floor Plans, Pacing) |                | (Timelines, Capacities)      |  |  
|  \+---------------------------+                  \+------------------------------+  |  
|                                                                                 |  
\+---------------------------------------------------------------------------------+

### **Module Interface Schema**

| Domain Module | Required Global Knowledge | Venue Memory Inputs | Ingested Signals | Generated Recommendations | Action Proposals | Mandatory Human Review Gates | Memory Writeback Targets | Contribution to Venue DNA |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Beverage** | Cocktail structures, unit conversions, allergen profiles18. | Cellar inventory, drink menus, pricing11. | POS beverage transactions, cellar levels2. | Cellar restocks, drink cost revisions22. | Order drafts, stock alert triggers2. | Pricing adjustments over 5%22. | Dynamic inventory logs, cellar records. | Informs cellar curation guidelines11. |
| **Culinary** | Recipe standards, cooking limits, safety codes18. | Kitchen layout, active food menus, supplier costs11. | Daily food orders, waste weights2. | Portion size tweaks, vendor swaps19. | Kitchen prep lists, inventory orders2. | Recipe structural changes, vendor contracts6. | Active prep logs, ingredient files. | Refines culinary style limits11. |
| **Service** | Hospitality models, pacing standards, guest psychology. | Table layout, SOP cards, service guides11. | Real-time POS transactions, door counts2. | Seat allocations, pacing alerts2. | Task assignments to floor staff2. | Modifying service SOP templates6. | Shift pacing summaries, task logs. | Defines service pacing expectations11. |
| **Event** | Event schemas, safety codes, staffing guidelines. | Spatial limits, event calendars, planning tools11. | Booking requests, payment milestones2. | Staff allocation plans, event menus6. | Client layout drafts, order forms5. | Budget changes over 10%6. | Event diaries, layout histories. | Establishes event planning standards11. |
| **Academy** | Educational design standards, study methods. | Curriculums, student logs, testing models11. | Test submissions, performance scores. | Course assignments, study updates6. | Staff study enrollment triggers. | Final academic certifications6. | Academic transcripts, lesson histories. | Verifies service skill baselines11. |
| **Guest** \[cite: 16\] | Taste profiles, dietary standards, global reviews16. | Guest preferences, booking history, interaction files11. | Active reservations, preference notes2. | Table seat assignments, menu notes16. | Dynamic profile additions5. | Merging conflicting allergen records6. | Guest relationship graphs, preferences3. | Defines premium guest care standards11. |
| **Reputation** | Review formats, language styles, rating indexes16. | Review history, brand response guides11. | Live review alerts, social sentiment hits2. | Proposed responses, sentiment summaries16. | Dynamic reply drafts5. | Responses to low-rating reviews6. | Sentiment trend sheets, review histories3. | Measures real-world brand delivery11. |
| **Operations** | Business formulas, shift metrics, staffing models. | Staff roster, local compliance, work templates11. | Check-ins, sales metrics, device alerts2. | Scheduling designs, task shifts2. | Shift schedule updates, utility controls5. | Modifying shift rules or schedules6. | Shift performance summaries3. | Highlights bottlenecks in execution11. |
| **Multi-Venue** | Group structures, comparative metrics, logistics. | Branch profiles, performance baselines11. | Daily cross-branch transfers, group sales2. | Inventory reallocations, brand updates6. | Branch inventory transfer requests5. | Transferring capital or staff between branches6. | Multi-venue logs, transfer registers. | Governs brand standards across locations11. |

### **Unified Integration in HESTIA**

HESTIA avoids isolated AI tools by anchoring all domain modules to a shared **Core Venue Ontology**1. Rather than using separate data structures, every module references shared semantic terms:

SQL  
\-- Conceptual RDF Triple representation of cross-domain integration  
\-- The Culinary Module's Menu Item maps directly to the Beverage Module's pairing logic  
\-- and the Guest Module's preference tracking under a single unified schema.  
HESTIA\_ONTOLOGY:Dish\_101        rdf:type            HESTIA\_ONTOLOGY:MenuItem .  
HESTIA\_ONTOLOGY:Dish\_101        HESTIA\_ONTOLOGY:hasAllergen    HESTIA\_ONTOLOGY:Shellfish .  
HESTIA\_ONTOLOGY:Beverage\_202    HESTIA\_ONTOLOGY:complements   HESTIA\_ONTOLOGY:Dish\_101 .  
HESTIA\_ONTOLOGY:Guest\_451       HESTIA\_ONTOLOGY:dislikes      HESTIA\_ONTOLOGY:Shellfish .

Because of this shared structure, if the **Culinary Module** flags a dish as containing shellfish, the **Guest Module** instantly identifies corresponding guest risks, and the **Service Module** issues allergen warnings to the server's handheld terminal, ensuring seamless coordination across domains1.

## **Part 12: HESTIA Intelligence Loop Framework**

The HESTIA system processes data through a continuous **Intelligence Loop**, running in a structured cycle to ingest signals, update memories, and safely execute operations2.

                         \[ INGESTION PHASE \]  
                       Raw Event Signal Ingest  
                                 │  
                                 ▼  
                         Entity Resolution  
                         (Query relational \+   
                        graph databases)  
                                 │  
                                 ▼  
                      \[ EVALUATION PHASE \]  
                       Claim Extraction  
                                 │  
                                 ▼  
                      Evidence Classification  
                      (Calculate confidence   
                         weights)  
                                 │  
                                 ▼  
                       Contradiction Check  
                                 │  
         ┌───────────────────────┴───────────────────────┐  
         ▼                                               ▼  
   Conflict Found                                 No Conflict  
(Flag discrepancy;                             (Dynamic Domain Routing)  
 halt automated flow)                          │  
                                                         ▼  
                                               \[ EXECUTION PHASE \]  
                                                Reasoning Engine  
                                               (Evaluate constraints   
                                               against Founder DNA)  
                                                         │  
                                                         ▼  
                                              Recommendation & Action  
                                               (Determine authorization   
                                                   thresholds)  
                                                         │  
                                                         ▼  
                                              \[ CONSOLIDATION PHASE \]  
                                               Outcome Evaluation  
                                                         │  
                                                         ▼  
                                                Memory Ledger Update  
                                               (Archive shift feedback   
                                                for future pacing)

### **Deep-Dive Analysis of the 17 Loop Steps**

#### **Step 1: New Input Ingestion**

* **Purpose**: Receive and standardize external operational events2.  
* **Inputs**: Raw system payloads (e.g., POS event stream or reservation alert)2.  
* **Outputs**: A standardized internal telemetry event object.  
* **Failure Modes**: Payload validation failures or network connection drops.  
* **Validation Methods**: Schema verification and check-sum matches.  
* **Implementation**: Real-time ingress processing using FastAPI.

#### **Step 2: Context Retrieval**

* **Purpose**: Compile the current physical and operational state of the venue1.  
* **Inputs**: The active venue ID, timestamp, and related entity IDs1.  
* **Outputs**: An active context frame containing table maps, schedules, and menus1.  
* **Failure Modes**: Stale context states retrieved from the database.  
* **Validation Methods**: Expiration checks on retrieved context variables.  
* **Implementation**: Queries executed in working and operational memory3.

#### **Step 3: Memory Retrieval**

* **Purpose**: Fetch historical and relationship data related to active entities3.  
* **Inputs**: Resolved entity keys3.  
* **Outputs**: Related guest preferences, past transaction histories, and active SOPs3.  
* **Failure Modes**: Search latency in semantic or vector index lookups3.  
* **Validation Methods**: Query timeout boundaries and connection pools.  
* **Implementation**: Parallel lookups executed in relational, graph, and vector layers3.

#### **Step 4: Entity Resolution**

* **Purpose**: Map incoming transactional IDs to a resolved entity in the knowledge graph3.  
* **Inputs**: Raw ID markers (e.g., email or reservation ID)12.  
* **Outputs**: A verified entity key (e.g., Guest UUID)3.  
* **Failure Modes**: Duplicate profile creations due to spelling variations3.  
* **Validation Methods**: Match confidence scoring and fuzzy string evaluations.  
* **Implementation**: SQL index queries and entity-merge logic pipelines.

#### **Step 5: Claim Extraction**

* **Purpose**: Convert raw system logs into standardized declarative claims8.  
* **Inputs**: Raw log strings2.  
* **Outputs**: Unverified claim triples8.  
* **Failure Modes**: Extracting irrelevant or erroneous statements.  
* **Validation Methods**: Dependency parsing and taxonomy validation.  
* **Implementation**: Local language processing microservices.

#### **Step 6: Evidence Classification**

* **Purpose**: Find and weight historical observations that support or refute a claim2.  
* **Inputs**: The unverified claim ID8.  
* **Outputs**: Weighted evidence link objects2.  
* **Failure Modes**: Linking irrelevant or outdated historical records3.  
* **Validation Methods**: Source reliability scoring and context matching2.  
* **Implementation**: Graph database traversal queries3.

#### **Step 7: Confidence Calibration**

* **Purpose**: Calculate the statistical validity of the active claim2.  
* **Inputs**: Collected evidence link weights2.  
* **Outputs**: A claims confidence rating ![][image1].  
* **Failure Modes**: Overconfident calculations due to duplicate inputs.  
* **Validation Methods**: Mathematical consistency checks and sensitivity analysis.  
* **Implementation**: In-memory calculations executed via Rust.

#### **Step 8: Contradiction Detection**

* **Purpose**: Check for logical conflicts with existing beliefs before acting3.  
* **Inputs**: The active claim and its confidence rating8.  
* **Outputs**: Logical consistency flags3.  
* **Failure Modes**: Missing logical contradictions due to incomplete ontologies.  
* **Validation Methods**: Non-monotonic consistency checks in the graph layer.  
* **Implementation**: Structural queries executed in Neo4j3.

#### **Step 9: Dynamic Domain Routing**

* **Purpose**: Route the verified claims to the corresponding domain module1.  
* **Inputs**: Cleaned claim objects and active context frames1.  
* **Outputs**: Domain-specific processing tasks.  
* **Failure Modes**: Event routing exceptions or execution bottlenecks.  
* **Validation Methods**: Router health checks and queue monitoring.  
* **Implementation**: Dynamic queue distribution using RabbitMQ.

#### **Step 10: Reasoning Engine Execution**

* **Purpose**: Evaluate the domain task against active policies and physical constraints1.  
* **Inputs**: Domain tasks and active policy frameworks1.  
* **Outputs**: Validated operational pathways.  
* **Failure Modes**: Rule evaluation conflicts or infinite logic loops.  
* **Validation Methods**: Logic parsing and execution timeouts.  
* **Implementation**: Non-monotonic evaluations executed in Neo4j.

#### **Step 11: Recommendation Synthesis**

* **Purpose**: Generate optimized solutions and proposals2.  
* **Inputs**: Validated operational pathways1.  
* **Outputs**: Recommendations and action proposals2.  
* **Failure Modes**: Generating irrelevant, redundant, or confusing proposals.  
* **Validation Methods**: Cost, time, and impact checks1.  
* **Implementation**: Policy evaluation filters matching active goals1.

#### **Step 12: Human Review Gate**

* **Purpose**: Route high-risk proposals to authorized managers for sign-off6.  
* **Inputs**: Generated recommendations and the authorization matrix6.  
* **Outputs**: Verification tokens or cancellation markers6.  
* **Failure Modes**: Delay bottlenecks due to unresponsive managers6.  
* **Validation Methods**: System timeout escalations and notification checks.  
* **Implementation**: Dynamic review tickets routed through management apps.

#### **Step 13: Action Execution**

* **Purpose**: Execute approved actions in connected digital platforms5.  
* **Inputs**: Approved action payloads and execution parameters5.  
* **Outputs**: Third-party API response states5.  
* **Failure Modes**: Connection drops or remote system failures during execution.  
* **Validation Methods**: Multi-phase transactional commits and API status checks.  
* **Implementation**: System connectors with error-retry capabilities2.

#### **Step 14: Ingest State Write-Back**

* **Purpose**: Log the executed action into the immutable decision ledger2.  
* **Inputs**: Execution outcomes, alternative options evaluated, and approvals6.  
* **Outputs**: A cryptographically signed record stored in the database6.  
* **Failure Modes**: Write-back errors risking loss of event logs.  
* **Validation Methods**: Log check-sum validation.  
* **Implementation**: Relational commits executed in PostgreSQL3.

#### **Step 15: Working Memory Reset**

* **Purpose**: Clear the active context workspace to prep for the next loop cycle3.  
* **Inputs**: The active context ID1.  
* **Outputs**: An empty, initialized working memory space3.  
* **Failure Modes**: Context leakages polluting subsequent execution loops.  
* **Validation Methods**: Clean-up verification audits on working memory objects.  
* **Implementation**: Dynamic garbage collection in memory3.

#### **Step 16: Outcome Tracking**

* **Purpose**: Monitor the venue's metrics to assess the results of the executed action2.  
* **Inputs**: Ingested shift data and outcome telemetry2.  
* **Outputs**: Performance variation vectors.  
* **Failure Modes**: Missing metrics or incorrect operational tracking2.  
* **Validation Methods**: Sensor baseline checks and correlation filters.  
* **Implementation**: Time-series evaluations comparing baseline expectations.

#### **Step 17: Cognitive Consolidation**

* **Purpose**: Prune redundant logs, archive old signals, and update beliefs3.  
* **Inputs**: Recent operational outcomes and historical logs3.  
* **Outputs**: Consolidated semantic entries and updated graph structures3.  
* **Failure Modes**: Erroneous consolidation, leading to lost historical context3.  
* **Validation Methods**: Transactional rolling schema updates.  
* **Implementation**: Background database sweep tasks executed overnight9.

## **Part 13: Minimum Viable Intelligence Infrastructure Roadmap**

HESTIA's development is structured into six phases, prioritizing foundational semantic scaffolding before deploying proactive domain automations10.

  Phase 1: Foundations ──► Phase 2: Confidence ──► Phase 3: Synthesis  
       (Ontology &             (Evidence-gated         (Pattern-matching,  
       Relational Base)           Ledgers)               Identity Drift)  
                                                               │  
                                                               ▼  
  Phase 6: Enterprise  ◄── Phase 5: Proactive  ◄── Phase 4: Domain  
       (Multi-Venue           (Self-correcting         (Modular agent  
       Federation)               Execution)               integrations)

### **Phase 1: Foundational Memory and Ontological Scaffolding**

* **What to Build**: Core relational databases (PostgreSQL)3; the unified Core Venue Ontology (mapping physical layout, menus, and staff structures)4; and basic multi-tenant schema partitioning5.  
* **What NOT to Build Yet**: Vector similarity databases3, automated pattern matching9, and proactive agent action pipelines5.  
* **Validation Criteria**: Database queries traversal matches physical layout maps with ![][image42] accuracy4. Standard query latency under ![][image43].  
* **Risks**: Creating overly rigid ontologies that require extensive database schema re-engineering as the system scales11.  
* **Expected Value**: Replaces disconnected operational files with a single, queryable digital model of the venue4.

### **Phase 2: Evidence and Confidence Core**

* **What to Build**: Vector similarity database engines (Qdrant/pgvector)3; evidence-gated claims ledgers9; mathematical calibration models for confidence scoring2; and temporal freshness decay sweeps3.  
* **What NOT to Build Yet**: Dynamic identity drift alarms11 and direct POS write-back execution tools5.  
* **Validation Criteria**: Verified observations decay in system confidence as planned3. Conflicting claims successfully trigger immediate consistency halts3.  
* **Risks**: Calculating false precision in confidence scores based on limited, uncorroborated source inputs.  
* **Expected Value**: Protects decision loops from hallucinated data and premature conclusions by requiring verifiable evidence.

### **Phase 3: Venue Intelligence Synthesis**

* **What to Build**: Ingestion engines for shift logs, reviews, and notes2; pattern-detection algorithms9; identity drift detection models11; and conflict flagging alert pipelines1.  
* **What NOT to Build Yet**: Dynamic task routing networks and third-party software write-backs5.  
* **Validation Criteria**: Pattern-detection algorithms identify simulated service bottlenecks with ![][image44] accuracy. Identity drift alarms are triggered correctly within simulated shift streams11.  
* **Risks**: Flagging normal, expected seasonal operational variations as permanent identity drift11.  
* **Expected Value**: Delivers deep, diagnostic evaluations of venue operations, revealing hidden bottlenecks and identity shifts.

### **Phase 4: Domain Intelligence Integration**

* **What to Build**: Core APIs for Beverage, Culinary, Service, and Guest agent modules16; secure write-back pipelines to POS and PMS engines5; and role-based access control (RBAC) enforcement across all modules6.  
* **What NOT to Build Yet**: Automated execution of suggestions without human sign-off6.  
* **Validation Criteria**: POS database menus and pricing cards updated securely5. Direct PMS room changes verified with full permissions validation6.  
* **Risks**: Connection drops or latency exceptions when updating legacy third-party software platforms6.  
* **Expected Value**: Shifts HESTIA from a diagnostic tool to an operational assistant, automating tedious scheduling, ordering, and administrative tasks.

### **Phase 5: Proactive Execution Loops**

* **What to Build**: Automated background workflows for high-confidence, low-risk operational adjustments6; outcome tracking analytics2; and automated diagnostic check procedures15.  
* **What NOT to Build Yet**: Capital reallocations or menu structural updates without owner approvals6.  
* **Validation Criteria**: Low-risk stock adjustments and scheduling modifications executed in background databases with zero errors.  
* **Risks**: Cascade execution errors where multiple automated corrections cause unexpected operational friction.  
* **Expected Value**: Frees managers from routine, repetitive tasks, allowing them to focus on active hospitality and guest satisfaction.

### **Phase 6: Multi-Venue Enterprise Federation**

* **What to Build**: Federated multi-tenant graph models5; group procurement optimization tools; multi-venue staff sharing schedulers; and aggregated comparative performance dashboards7.  
* **What NOT to Build Yet**: Broad global sharing of sensitive guest details across unrelated tenancies.  
* **Validation Criteria**: Group transfer recommendations executed securely across simulated distinct business databases with zero data leaks.  
* **Risks**: Network latency and data isolation challenges across distinct regulatory jurisdictions6.  
* **Expected Value**: Empowers large hospitality groups with systematic, centralized portfolio analytics and strategic resource planning7.

## **Part 14: Failure Modes & Anti-Patterns Framework**

To survive the physical realities of high-stakes hospitality operations, HESTIA's design anticipates potential failure modes:

### **1\. Fake Intelligence (Hallucinated Grounding)**

* **Cause**: Over-reliance on ungrounded language models to write database updates directly1.  
* **Warning Signs**: The system proposes menus featuring impossible pairings or non-existent ingredients18.  
* **Consequences**: Complete loss of staff trust and potential inventory mistakes.  
* **Prevention**: Strict ontological validation where all model outputs are parsed and checked against the database taxonomy before being shown to users1.  
* **Detection**: Syntax checks flagging values that do not exist in the active ontology graph10.  
* **Correction**: Terminate the active execution thread and regenerate proposals using exact semantic database values6.

### **2\. Generic AI Responses**

* **Cause**: Prompt templates that do not retrieve the venue's specific DNA parameters10.  
* **Warning Signs**: Operational recommendations contain obvious, unhelpful advice (e.g., "provide good service")1.  
* **Consequences**: The platform is dismissed by operators as a generic chatbot wrapper10.  
* **Prevention**: Inject active founder values, style metrics, and venue parameters into every context workspace1.  
* **Detection**: Semantic comparison scans alerting when model outputs diverge from the founder's communication style11.  
* **Correction**: Rebuild prompt generators to enforce constraints from the Founder Digital Twin layer11.

### **3\. Memory Pollution**

* **Cause**: Ingestion of redundant operational logs, noise, and system alerts into long-term stores3.  
* **Warning Signs**: Search latency increases and irrelevant historical details are returned3.  
* **Consequences**: Cognitive dilution and degradation of recommendation accuracy.  
* **Prevention**: Dedicate background tasks to clean, consolidate, and deduplicate episodic records3.  
* **Detection**: Graph scanning checks flagging duplicate entity profiles or redundant nodes.  
* **Correction**: Run deduplication processes and archive unreinforced observations to cold storage3.

### **4\. Stale Memory**

* **Cause**: Failure to run confidence decay checks over older historical observations3.  
* **Warning Signs**: The system generates plans based on out-of-date schedules or old menus3.  
* **Consequences**: Operational confusion, double-bookings, or incorrect inventory counts.  
* **Prevention**: Implementation of decay calculations over the entire proposition database layer3.  
* **Detection**: Verification scans flagging records older than their defined freshness thresholds3.  
* **Correction**: Trigger sync tasks to update out-of-date relational fields from active system logs2.

### **5\. Over-Personalization**

* **Cause**: Elevating single, isolated guest preferences to rigid rules in the semantic layer3.  
* **Warning Signs**: The kitchen receives highly complex, customized order rules for standard menu items16.  
* **Consequences**: Severe kitchen pacing bottlenecks and disrupted prep workflows21.  
* **Prevention**: Restrict customization changes to validated guest profiles with high alignment metrics3.  
* **Detection**: Pattern checks flagging rapid increases in dynamic recipe changes.  
* **Correction**: Revert custom prep requirements to standard SOP baselines21.

### **6\. Creepy Guest Memory**

* **Cause**: Recording private, sensitive, or inappropriate personal observations about guests16.  
* **Warning Signs**: Service notes contain detailed, intrusive descriptions of guest conversations6.  
* **Consequences**: Violation of privacy standards, customer discomfort, and legal risks.  
* **Prevention**: Enforce PII filters and strict data sensitivity ratings in the ingestion ledger16.  
* **Detection**: Regex and keyword scans alerting when private flags or sensitive terms are logged16.  
* **Correction**: Delete non-compliant records from the database and alert staff to brand privacy guidelines6.

### **7\. Hallucinated Venue Facts**

* **Cause**: Synthesizing spatial, legal, or inventory constraints from unstructured text3.  
* **Warning Signs**: Table plans show non-existent seats or inventory balances are incorrect4.  
* **Consequences**: Seating bottlenecks, physical service pacing errors, and booking issues4.  
* **Prevention**: Hard physical rules (e.g., table layouts or licensing limits) must be read-only schema values6.  
* **Detection**: Relational constraints database mismatch alerts.  
* **Correction**: Revert spatial databases to standard CAD designs and check sensor sync4.

### **8\. Overconfident Recommendations**

* **Cause**: Generating automated actions without calculating evidence weights or source trust2.  
* **Warning Signs**: High-impact financial or menu changes executed with minimal underlying evidence6.  
* **Consequences**: Significant pricing errors and damaged vendor relationships6.  
* **Prevention**: Implement evidence calibration checks before generating actions2.  
* **Detection**: Tracking actions proposed with low corroborating evidence metrics2.  
* **Correction**: Roll back executed changes in the target software and pause automation6.

### **9\. Domain Module Fragmentation**

* **Cause**: Modules bypassing the shared knowledge backplane to use isolated databases1.  
* **Warning Signs**: Different modules present contradictory recommendations1.  
* **Consequences**: Inconsistent system actions and fragmented management experiences.  
* **Prevention**: Force all modules to write back and read from a shared semantic ontology graph1.  
* **Detection**: API checks flagging queries to unmapped relational tables.  
* **Correction**: Revoke module access keys until schemas are successfully re-aligned to the core ontology10.

### **10\. Prompt-Only Architecture**

* **Cause**: Managing complex business logic and rules within system prompt text1.  
* **Warning Signs**: High latency, elevated token costs, and highly unpredictable system outputs10.  
* **Consequences**: Unscalable architectures that are difficult to debug or secure.  
* **Prevention**: Define logical states, workflows, and policies in code or database rules1.  
* **Detection**: Tracking token footprints in core operational loops.  
* **Correction**: Rebuild prompt structures, moving procedural logic to deterministic code modules10.

### **11\. Excess Analysis, No System Execution**

* **Cause**: Designing complex theoretical ontologies without building active execution loops5.  
* **Warning Signs**: Detailed operational summaries are generated, but no automated actions are taken.  
* **Consequences**: Low business value; platform remains an analytics dashboard rather than an OS6.  
* **Prevention**: Build data pipeline connectors with active write-back capabilities early5.  
* **Detection**: Operational metrics tracking zero outbound write-backs to POS or PMS systems5.  
* **Correction**: Build standardized write-back pipelines for low-risk scheduling or menu tasks6.

### **12\. Overengineered Knowledge Graph**

* **Cause**: Designing complex graph models for minor, irrelevant operational metrics3.  
* **Warning Signs**: Database write latencies degrade and graph traversals slow down.  
* **Consequences**: Degraded system performance and complex database maintenance.  
* **Prevention**: Use graphs only for core business entities, relationships, and constraints3.  
* **Detection**: Graph databases query traversal durations exceeding ![][image45] thresholds.  
* **Correction**: Prune unnecessary node classes and move metrics logs to the relational database3.

### **13\. Lack of Human Review**

* **Cause**: Running automated high-risk action loops without active validation checks6.  
* **Warning Signs**: Major adjustments to menus or pricing executed without manager approvals6.  
* **Consequences**: Substantial loss of margins, regulatory fines, or damaged brand reputation6.  
* **Prevention**: Implement strict RBAC security boundaries that block automated high-risk tasks6.  
* **Detection**: Checking high-risk database writes for matching approval tokens6.  
* **Correction**: Pause automated operations and require manual sign-off for sensitive tasks6.

### **14\. Weak Access Permissions**

* **Cause**: Flat database privileges and unverified API access keys6.  
* **Warning Signs**: Line staff accessing high-level financial reports or personal records6.  
* **Consequences**: High data security risks, internal friction, and potential leakages.  
* **Prevention**: Implement cell-level security and strict RBAC filters6.  
* **Detection**: Audit logs showing access requests from unauthorized roles2.  
* **Correction**: Reset system credentials and enforce strict, verified access controls6.

### **15\. No Audit Trail**

* **Cause**: Failing to log system actions, decisions, and outcomes2.  
* **Warning Signs**: Changes are made inside POS or PMS tools without clear records of their origin6.  
* **Consequences**: Untraceable errors, security risks, and inability to resolve bugs.  
* **Prevention**: Log all loop executions and human decisions to the immutable database ledger2.  
* **Detection**: Discrepancies between external system updates and internal database logs6.  
* **Correction**: Require cryptographic sign-offs on all outbound write-back operations6.

### **16\. Confusion of Venue Memory with Venue DNA**

* **Cause**: Treating raw observations as permanent brand standards3.  
* **Warning Signs**: Standard menus are modified dynamically after a single shift's stock shortage11.  
* **Consequences**: Unstable brand guidelines, staff confusion, and inconsistent experiences11.  
* **Prevention**: Maintain a clear division between raw event databases and stable DNA rules11.  
* **Detection**: Dynamic changes written directly to stable brand DNA tables without manager review6.  
* **Correction**: Lock the brand DNA database as read-only and restrict adjustments6.

### **17\. Confusion of Founder Emotion with Founder Strategy**

* **Cause**: Writing temporary strategic feedback or emotional logs as core guidelines11.  
* **Warning Signs**: Deep menu overhauls recommended based on a single frustrated manager log11.  
* **Consequences**: Inconsistent operational standards and damaged relationship with owners.  
* **Prevention**: Require strategic founder rules to be explicitly verified across multiple logs11.  
* **Detection**: Anomaly checks flagging baseline modifications based on unstructured shift notes.  
* **Correction**: Revert guidelines to the owner's verified baseline onboarding standard11.

### **18\. Treating Temporary Noise as Identity Drift**

* **Cause**: Failing to evaluate operational variations against seasonal baseline trends11.  
* **Warning Signs**: Identity drift alarms are triggered during expected busy holiday weekends11.  
* **Consequences**: Alert fatigue, ignored warnings, and unnecessary strategic meetings.  
* **Prevention**: Filter observations through seasonal and historical baseline metrics11.  
* **Detection**: Spikes in identity drift alerts during known high-volume holidays11.  
* **Correction**: Adjust drift detection algorithms to incorporate temporal demand patterns11.

### **19\. Making Recommendations Without Corroborating Evidence**

* **Cause**: Generating operational plans based on isolated, unverified signals2.  
* **Warning Signs**: Major staff reallocations proposed after a single, unverified sensor alert2.  
* **Consequences**: Chaotic service workflows and highly frustrated floor teams2.  
* **Prevention**: Implement strict minimum validation thresholds before flagging operational bottlenecks1.  
* **Detection**: Recommendations generated with low confidence scores2.  
* **Correction**: Terminate execution loops and log missing indicators to diagnostic checklists15.

## **Part 15: Production Readiness Checklist & HESTIA Core Intelligence Blueprint**

### **Production Readiness Checklist**

This checklist details the verification steps required to certify HESTIA as production-ready:

\[ \] Data Partitioning & Isolation  
    \- Verify Row-Level Security (RLS) policies are active on PostgreSQL database.  
    \- Validate that query execution paths are constrained to separate tenant namespaces.  
    \- Confirm all guest PII and financial records are masked for non-authorized roles.

\[ \] Epistemological Memory Management  
    \- Confirm raw experiences are written to append-only ledgers.  
    \- Verify Ebbinghaus decay functions run correctly over historical observations.  
    \- Test that conflicting claims successfully trigger manual review halts.

\[ \] Core Ontological Scaffolding  
    \- Validate that physical venue maps, menus, and staff roles match the unified graph schema.  
    \- Test multi-hop reasoning pathways to ensure accurate data extraction.  
    \- Confirm all active domains reference identical ontological classes.

\[ \] Operations Governance Guardrails  
    \- Verify high-risk operations are blocked by manual human review gates.  
    \- Validate the audit ledger records all system actions, changes, and overrides.  
    \- Test that system rollback workflows restore previous states without data loss.

### **HESTIA Core Intelligence Blueprint**

The system is constructed of three distinct conceptual layers, ensuring clean separation of data collection, operational reasoning, and manual governance:

\+---------------------------------------------------------------------------------+  
|                         HESTIA SYSTEM ARCHITECTURE                              |  
\+---------------------------------------------------------------------------------+  
|                                                                                 |  
|                        \+---------------------------+                            |  
|                        |   HUMAN GOVERNANCE LAYER  |                            |  
|                        |   \- Owner Approval Desk   |                            |  
|                        |   \- Role Access Control   |                            |  
|                        |   \- Decision Audit Logs   |                            |  
|                        \+-------------+-------------+                            |  
|                                      ^                                          |  
|                                      │  Approvals & Constraints                 |  
|                                      v                                          |  
|                        \+---------------------------+                            |  
|                        |     REASONING LAYER       |                            |  
|                        |   \- Founder Twin Rules    |                            |  
|                        |   \- Domain Analytics      |                            |  
|                        |   \- Pattern Detection     |                            |  
|                        \+-------------+-------------+                            |  
|                                      ^                                          |  
|                                      │  Entity Resolution & Fact Traversal      |  
|                                      v                                          |  
|                        \+---------------------------+                            |  
|                        |  EPIDEMIOLOGICAL LEDGER   |                            |  
|                        |   \- Relational Database   |                            |  
|                        |   \- Knowledge Graph       |                            |  
|                        |   \- Vector Embeddings     |                            |  
|                        \+---------------------------+                            |  
|                                                                                 |  
\+---------------------------------------------------------------------------------+

## **Part 16: Comprehensive Architectural & Implementation Recommendations**

To construct the foundational intelligence infrastructure for the HESTIA Venue Intelligence Operating System before analyzing any specific venue, the following production-grade stack, data model design, and implementation sequence are recommended.

### **Foundational Database and Ontological Stack**

\+---------------------------------------------------------------------------------+  
|                            HESTIA DATABASE STACK                                |  
\+---------------------------------------------------------------------------------+  
|                                                                                 |  
|  \+---------------------------+        \+--------------------------------------+  |  
|  |     Relational Engine     |        |            Knowledge Graph           |  |  
|  |       (PostgreSQL)        |        |               (Neo4j)                |  |  
|  |  \- Operational Relational  |        |  \- Declarative Ontology Nodes        |  |  
|  |  \- Audit Log Ledgers      |        |  \- Structural Brand Constraints      |  |  
|  \+-------------+-------------+        \+------------------+-------------------+  |  
|                |                                         |                      |  
|                \+--------------------+--------------------+                      |  
|                                     |                                           |  
|                                     v                                           |  
|                       \+---------------------------+                             |  
|                       |    Vector Search Engine   |                             |  
|                       |         (pgvector)        |                             |  
|                       |  \- Semantic Search Items  |                             |  
|                       |  \- Episodic Memory Arrays |                             |  
|                       \+---------------------------+                             |  
|                                                                                 |  
\+---------------------------------------------------------------------------------+

#### **The Relational Engine: PostgreSQL (with pgvector and timescaledb extensions)**

PostgreSQL serves as the transactional foundation, managing active shifts, floor layouts, table states, and the immutable Decision and Audit ledgers with ACID guarantees2. The timescaledb extension handles high-velocity operational event streams, while pgvector indexes and queries episodic memory embeddings3.

#### **The Graph Engine: Neo4j (or an enterprise-grade Graph Database)**

Neo4j stores the semantic venue models, founder guidelines, and procedural SOPs3. Graph database technology is essential for multi-hop operational traversals (e.g., verifying if a table assignment conflicts with a guest allergen profile linked to a specific kitchen prep station)1.

#### **The Execution Runtime: Python (FastAPI) and Rust**

The operational loops run on a fast, asynchronous Python gateway (FastAPI), while critical real-time performance tasks (such as event streaming, security checks, and math calibrations) are written in Rust for speed and safety.

### **Recommended Core Data Model Schemas**

SQL  
\-- Schema representation of a resolved Entity Node in the HESTIA system  
CREATE TABLE core\_entity (  
    entity\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    tenant\_id UUID NOT NULL,  
    venue\_id UUID NOT NULL,  
    class\_type VARCHAR(64) NOT NULL, \-- e.g., 'GUEST', 'STAFF', 'INGREDIENT'  
    metadata JSONB NOT NULL,  
    created\_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  
    updated\_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);

\-- Schema representation of an immutable event ledger entry in the HESTIA system  
CREATE TABLE raw\_observation\_ledger (  
    observation\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    tenant\_id UUID NOT NULL,  
    venue\_id UUID NOT NULL,  
    source\_id VARCHAR(128) NOT NULL,  
    payload JSONB NOT NULL,  
    ingested\_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);

\-- Schema representation of an unverified claim under validation in HESTIA  
CREATE TABLE dynamic\_proposition (  
    proposition\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    tenant\_id UUID NOT NULL,  
    subject\_entity UUID NOT NULL REFERENCES core\_entity(entity\_id),  
    predicate\_relation VARCHAR(128) NOT NULL,  
    object\_assertion TEXT NOT NULL,  
    confidence\_score NUMERIC(4,3) NOT NULL CHECK (confidence\_score BETWEEN 0.000 AND 1.000),  
    uncertainty\_margin NUMERIC(4,3) NOT NULL CHECK (uncertainty\_margin BETWEEN 0.000 AND 1.000),  
    temporal\_decay\_coefficient NUMERIC(6,5) NOT NULL,  
    last\_validated\_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);

\-- Schema representation of evidence backing a claim  
CREATE TABLE proposition\_evidence\_link (  
    link\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    proposition\_id UUID NOT NULL REFERENCES dynamic\_proposition(proposition\_id),  
    observation\_id UUID NOT NULL REFERENCES raw\_observation\_ledger(observation\_id),  
    evidence\_weight NUMERIC(4,3) NOT NULL CHECK (evidence\_weight BETWEEN 0.000 AND 1.000),  
    created\_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);

### **Initial Execution and Onboarding Sequence**

#### **Step 1: Establish the Ontological Foundation**

Map the global rules of hospitality, culinary operations, beverage programs, and service flows into a base knowledge graph11. This read-only base provides a consistent, structural language for all future venue installations10.

#### **Step 2: Complete the Onboarding Program**

Onboard new venues using structured surveys to capture physical constraints, pricing guidelines, and standard schedules, while transcribing strategic interviews with the owner to seed the Founder Memory layer4.

#### **Step 3: Construct the Core Memory Architecture**

Deploy PostgreSQL and Neo4j database partitions, verifying tenant isolation models and row-level security policies to prevent cross-venue data contamination5.

#### **Step 4: Configure Data Ingest Connectors**

Activate integrations with POS, PMS, reservation, and scheduling platforms, mapping raw system transactions to resolved entities in the knowledge graph2.

#### **Step 5: Initialize the Core Intelligence Loops**

Launch the consolidation and reasoning engines in a draft-only simulation environment9. Evaluate the system's ability to accurately detect service bottlenecks, identity drift, and founder vision conflicts without executing external changes6.

#### **Step 6: Certify Active Operations**

Once reasoning confidence meets production guidelines, activate write-back integrations and RBAC controls, shifting HESTIA from a diagnostic assistant to a proactive Venue Intelligence Operating System5.

#### **עבודות שצוטטו**

1. Next Gen of AI Agents That Know, Contextualize, and Remember \- theCUBE Research, [https://thecuberesearch.com/next-generation-ai-agents/](https://thecuberesearch.com/next-generation-ai-agents/)  
2. The Brain — Seven-Layer Enterprise AI Architecture for Mid-Market Businesses \- Hureka Technologies, [https://www.hurekatek.com/brain](https://www.hurekatek.com/brain)  
3. Agentic AI Memory vs Vector Database: Architecture Guide 2026 \- Atlan, [https://atlan.com/know/agentic-ai-memory-vs-vector-database/](https://atlan.com/know/agentic-ai-memory-vs-vector-database/)  
4. Custom Procurement Ontology Design: A Blueprint for AI-Driven Operations \- Ethicrithm, [https://ethicrithm.com/custom-procurement-ontology-design-a-blueprint-for-ai-driven-operations/](https://ethicrithm.com/custom-procurement-ontology-design-a-blueprint-for-ai-driven-operations/)  
5. AgentOS, The Operating System for AI Agents \- Enhans, [https://www.enhans.ai/agent-os](https://www.enhans.ai/agent-os)  
6. Enterprise Legal AI Case Study: Scaling with Legal Ontology \- HAQQ, [https://haqq.ai/case-study/legal-ontology](https://haqq.ai/case-study/legal-ontology)  
7. Kingdee Launches Enterprise AI Operating System "Lingee", [https://www.kingdee.com/global/2026/05/20/kingdee-launches-enterprise-ai-operating-system-lingee/](https://www.kingdee.com/global/2026/05/20/kingdee-launches-enterprise-ai-operating-system-lingee/)  
8. arXiv:2604.11364v1 \[cs.AI\] 13 Apr 2026, [https://arxiv.org/pdf/2604.11364](https://arxiv.org/pdf/2604.11364)  
9. Beyond Context Graphs: Agentic Memory, Cognitive Processes, and Promise Graphs | by Volodymyr Pavlyshyn | Artificial Intelligence in Plain English, [https://ai.plainenglish.io/beyond-context-graphs-agentic-memory-cognitive-processes-and-promise-graphs-f1234cd1537f](https://ai.plainenglish.io/beyond-context-graphs-agentic-memory-cognitive-processes-and-promise-graphs-f1234cd1537f)  
10. Overview | NaasAI Platform Docs, [https://docs.naas.ai/architecture/what-is-abi/](https://docs.naas.ai/architecture/what-is-abi/)  
11. Ontology design: Best practices \- Palantir, [https://palantir.com/docs/foundry/ontology/ontology-best-practices/](https://palantir.com/docs/foundry/ontology/ontology-best-practices/)  
12. Core concepts \- Palantir, [https://palantir.com/docs/foundry/ontology/core-concepts/](https://palantir.com/docs/foundry/ontology/core-concepts/)  
13. Object and link types • Object types • Overview \- Palantir, [https://palantir.com/docs/foundry/object-link-types/object-types-overview/](https://palantir.com/docs/foundry/object-link-types/object-types-overview/)  
14. DESC-Restaurant Ontology Structure | Download Scientific Diagram \- ResearchGate, [https://www.researchgate.net/figure/DESC-Restaurant-Ontology-Structure\_fig1\_49399417](https://www.researchgate.net/figure/DESC-Restaurant-Ontology-Structure_fig1_49399417)  
15. Agent Axiom in AI Architecture and Cognitive Economy, [https://www.cognitiveeconomy.org/agent-axiom/](https://www.cognitiveeconomy.org/agent-axiom/)  
16. Modeling ontological relationships for personalization of restaurant recommendations \- Leonid Keselman, [https://leonidk.com/pdfs/cs270.pdf](https://leonidk.com/pdfs/cs270.pdf)  
17. Menu Engineering 101: How to Maximize Profit from Every Dish \- Foodics, [https://www.foodics.com/menu-engineering-matrix-for-restaurants/](https://www.foodics.com/menu-engineering-matrix-for-restaurants/)  
18. An analytical approach to building a core ontology for food \- Emerald Publishing, [https://www.emerald.com/jd/article/73/1/123/199707/An-analytical-approach-to-building-a-core-ontology](https://www.emerald.com/jd/article/73/1/123/199707/An-analytical-approach-to-building-a-core-ontology)  
19. How Menu Engineering Creates Profitable Menus \- NetSuite, [https://www.netsuite.co.uk/portal/uk/resource/articles/business-strategy/menu-engineering.shtml](https://www.netsuite.co.uk/portal/uk/resource/articles/business-strategy/menu-engineering.shtml)  
20. Menu Engineering Matrix: Your Guide to Stars, Puzzles, & More \- Toast POS, [https://pos.toasttab.com/blog/on-the-line/menu-engineering-matrix](https://pos.toasttab.com/blog/on-the-line/menu-engineering-matrix)  
21. Menu engineering and activity-based costing: An improved method of menu planning \- Emerald Insight, [https://www.emerald.com/ijchm/article/28/7/1417/123919/Menu-engineering-and-activity-based-costingAn](https://www.emerald.com/ijchm/article/28/7/1417/123919/Menu-engineering-and-activity-based-costingAn)  
22. How a Menu Engineering Matrix will Help Your Bottom Line, [https://sterlingsilverpremiumbeef.com/article/how-a-menu-engineering-matrix-will-help-your-bottom-line/](https://sterlingsilverpremiumbeef.com/article/how-a-menu-engineering-matrix-will-help-your-bottom-line/)  
23. Dell and Palantir Introduce an On-Premises AI Operating System, [https://www.dell.com/en-us/blog/dell-and-palantir-introduce-an-on-premises-ai-operating-system/](https://www.dell.com/en-us/blog/dell-and-palantir-introduce-an-on-premises-ai-operating-system/)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEkAAAAYCAYAAAC2odCOAAACOUlEQVR4Xu2XPUtdQRCGByVCTDqxMggiaURQEISIXX6AhX8gnSmtLJRAkFQ2AUGxsDBp0iZYBAJRAyI2IcRaEdTYBlJHzE52F8f3zKxz5OIVvQ8M7D7znrsfip5L1KJFi1vAeaiNVPeBtxTPyud2UwovhZpH6aAn1KdQk9i4Ju9ROJgO9THUU2wkSueuoIVf0mXP489iXoKze2n8KM3bL9ouOkO9CHVC8XltjyU4P5DG79Ic0ZyJFmbXprirmKJqbkFxV9EfaiKN616S/CFJt6k4NxheVhzD7gglYB1Ic16sz7TgbBe43eQlOC+CYWtTlpdw/xglRc+/UdfBs27mOenZFap6nBfBsLUpy0u4/x0lRf8LpRPPupk10rP8zwc9zotg2NqU5SXc30FJvmct6jz7lfTsHEX/UDgtZ4Jha1OWlzT7kr6Qns2X9EA4LWeCYWtTlpdw/wdKiv4ApRPPuplF0rNvqOpxXgTD1qYsL+H+H5QU/SxKJ551M0OkZz9Q1eO8CIZnFMew+4YSsA6kOS/WZ1pwdgzc7+QlOC+ihdkNi3lHchLus+O34sxocpJ9xeWD94LXKF2S1jtLJeHMK8W50cJPKPrxUINpzO8gkvyVYxX8z+Qfh3qdxsghRa+9LjD8tp8vAEuiOYbdOsWvQ39DnV5u/0d7zqQU5ovoRukkf3cqsY2iwYygEJTOXaFWuIE8Q3HD1Dp3rXADada6mVrr1wo3iD4UTaDWua0/ineVLbpf521x4/wDi+7Th5ml59UAAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAVCAYAAAAnzezqAAABWElEQVR4Xu2UwSpFURSGFyI3ipIMjG4xMVJm3kHewciAMlNXJpJnMDARpZQopSRhxMjAK5CpiSGxVnvt/Ps/u3P20OB8tWr/31pn333OveeKtLQENrQutGa5UcCW1jFLZ0Wrn9y41hSKH605Xx96LmFb0llbr0E2Ht1zJbxQtoE7csyohDm+O978wV2spbQdmKD8JNWNmOydSHCbkG9gXcy+5DdH6g6A/hrWxexIfnOEPyjC/oq81cBfO4/9qm2www3gVsoOcK71DnlQQn8IXIV4ABuuw2bsTYh8ussdDGmc2ZWGAQAfbby7pmsbZ06kYaAGu+6I8jPk6JL9FzEoH1J2AJvpQp50F+nz/ArOqBzgG4OEJn638+7ewMXHvQfO8hnk6Bhz6ywuJbweX5L+ao0RCTMH5M3ZX/eyr++TbmBMQm9Vq+fr02QCWGBRyAyLDMNa0yxb/gW/S59rVJtfnb8AAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAAAVCAYAAAD/wUjgAAACXUlEQVR4Xu2XS6iNURTHF0XKI4/cgZRrqIQJBszIFANjAwYeRRkoMTI0MEKZKBMzEt2kGMhAeY0MKKUYKTIQUV7r317LWd//W/uc71y6d3DOr/7dvX57f/vbZ5/vca7ImDFjxvwb51gQRzW3NTu4g7ioOctyCH6HzCr9FoC+udbeZzVzSJoe7TuhHoZ3kp9jRqktIPNnNK/JxU2LbjrclOkf+9+oLSDzq6TpL1HtwL1l2YEbks83o9QWAI8sCe695liofQxT84PotyE7ZfBzrCuYZ6u1d8UO0G8B/sE+aB5qXjVG1D94zUd2SxlzSjOp+ap5Zi5yixzan0PtLgZsS9x5zWNrg1+WBryAyKQ0J13X6G2eLFLzzoSUfn72fDQfyeZCvZfcF/ORKc2yUHM/6LwhS6XX98nayOm/I/LFgpp3av24AjPPYMwjllL8Fqojft4N5BvwQQ77Feai59qpeafWX9uQtVK+SfT9sL/x0nfivPOk/bvIXwoxLTJ5XHIPoq9NWvNOrT/bkO/m4u2F+kmoncPSO751KwQWSvmtlK6jJZSDknsQ/UmqHbgHLAPpQiTfENT8TcM91ewhD9CHFwDPAzq5ljAyv1jaHvWmUM83NwiMWZ44Phb1iVAvMPdScyB455uUfoxj4OckriU8m4PfaO66lFfYC6uZ1VL8ds16a3f5vbBGytjnmmuan9K7QhD8qwCuWo1L/L7mrmZ/GMfgA2cewOM8bzRXrOYvZSC4d+OTuwbuy5UsZwFsyAWWowYeoH4r4C008uDSP6JZJOWBOvLck7Ipl7ljWP4AKeLeQyaOI4gAAAAASUVORK5CYII=>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAVCAYAAAAnzezqAAABNUlEQVR4Xu2UQSsFYRSGT0RJ2chOUZKSomQjO3/G0spGNrr+gCILC1a2ykIpyc7aT5Bs/QHie2fOl3feOcNMLCzmqbd7znO+mXsW97tmPT1fjKVMqGzBUcq+SmE75TJlXgfgIOXDMyOz79iy8pkM6mvqM/CLXp97X2HNP7sugPNDgdP+MXB34gq6LHBs9S8DcE/ST1IPHtzX6LIAzkYvYb9JNXNisf/zBc6oZvCDjXwhZ1U20GaBW6qZXSs9bl0FyDmVDbRZ4IZqJi8wogPI8J4GtFngkGpmYLEv5ILKBtossEw1c2GxL2T+w/iJHYtfAncv/Tr14NV9DcgllYkVK2fP4uEwy4y6Y949DM7sqYiSGff+lByYdr9h5eKocfcV+KuU4ZS3lJfq+PdgwSmVAasqev4Fn4knaQ76g8psAAAAAElFTkSuQmCC>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAAAVCAYAAAD/wUjgAAAClklEQVR4Xu2WP2gUQRTGn0ZR0UYRwTQqCAqKgqIGbCJKwEpTiBaChUVQOwmKjYiFYCMiaWwEQSwlJMQQ0MpCNImCiH+wSGFaQQ0RhWh8382bu7ffzSSXnHDC3Q8+dt/33s7OzszOrkiLFi1a1MdVNhKcVA2ptnJCucGGcpqNGph1aijrJXRikhPKCgm5HRZfU90pZwP+QaL6CxW181n+gwEBvyV0ZC353LnUDPqB+K5aVkwvCAwkt98QJiR0ZK/zUg+P1bGPPK6ph0fyb9tbNKmHRzxAXgq+rh7mGpAjqsNsLhK0c8DOu3wC7JHQiQ7n7TTvgh1v2vGdq4nA321H6HkxneWYhPorqs2qH6px8zyYFO/hfMrF0fMCBxPeLdVLOwd/TAVQvJ28XvO5c4gHE942F782by42SKhZSv4X8z25fnSTN22+B19Gvy9yHlQNCOCbXrf4k/MA1+VATQ+bjlw7HyXtM6hJrUT4+yn2xPvuIr+KOGP4SoBOiy/HAiP3IMx8dbl8bkC2SJhJ5Gbs6Jd+xLe7XMLEetqlUpPrQxlfsMTOL1XSJbiRxxa3OQ9wHZPLpwbkl3n+9UI86uLIOalcn3wVjNWqYcn3o/RAnMT5QxdHz9dgc0O8ynkA3hvyPNxOJDUgiHmm4Y2pjpMPkHtmR6ZWrzxap5z33jxP7Ehko+q2i8EDqb4uBWrWJTy+FvFFF68074PqrPMjPyXkUcfAx+pnr8BTM/FJYuBj9z5k51+L6RIvVN9UR1VvJd8ZZpOE2lcSViL+luMKgU5Y3X2LMWno64jqjKtj4uueAj7uM6G6ZzFPStWnL4X/R8mBfxdsZI0GA9LHZrOBDTS+CvgKNT1Y+udVayRsqE3PEwmDcpcTC+Uvwhzm3J7HHTkAAAAASUVORK5CYII=>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAVCAYAAAAnzezqAAABOElEQVR4Xu2UvUoDURCFB8VCtBMfIKCNjYKdrQ/gi1jYWUgaER/AKkUKg4KVINgJoqV1nkFsbSwNOse9N56c3OxsBLv9YGDmzLlnL/lZs5aWiiOvO69NXTTgxOtaRaE2/8trK/WDNDeha5Ne9Ic0Z8L8ocwwPImmrFrlWxBdwzGH+Ws8OC82HaRgX/JAO5Z57vyeBQarv0DW96lnwvxTCwzW7AKX1DNhPn7VMCzrgni0cghfYJYnzM+GJV0I8OCfkPlIWn7oA/VMmH9m5YMl8gNzIF/ggnomzL+xwFADzl2lfjvNylT+Hg/Ou5UPKvB0aF5PGoM5zB/xYNWSv9udpL2Slj/uc9Iw39IMkB3l/wj3Xoten15vvHRWrPL0RYeGV+tB6p8ntr9E+WN2VWjIhgoz+Gt+y//yDS/bbpmMbFU6AAAAAElFTkSuQmCC>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAVCAYAAAAElr0/AAABW0lEQVR4Xu2Vv0oDQRDGp7BRxEZttEhQohJio6JlOhvBBMVn8Al8AVsLHyUvkN6nEGJhZ+Wfxsbsx+3I7MdOcteFsD8YcvPbIXffcbcnUigU6rAaaoNlhj9TC4deWIsXHO5lQYOAJkEuZEmCnMiSBDmW5kFOQ12yrMEKi3k0CXIk1fxWqPdQe6F+o2NupfKbUl0Ujl/MOnotZWLcILpX43ZCjUyfANFm6aBB3sjDrZu+Hx0D92z6WXMaxDqdxe+nWfuX+ywdNAgDd0W9N2e99855QZ7IJWCgw9JhVpBr6nNzH5L6LvWKF+SMXAIGDlk6eC87n9gL8i2px5OQm+P/U9cjl4AB3Jk6nIt/4iH13pz1u9QrcDcZd0AuYW5Sg/dBhLszve5SDFw74yzj6B7Iw7mPlt4hWx48h5pknLIWe2zT2GFw3DLryo9Ua4+hvkJtx17Lbr98jkKhUIMpXZuFVMAGPGoAAAAASUVORK5CYII=>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAVCAYAAAAnzezqAAABLUlEQVR4Xu2UMUpDURBFLwSFaOkCrGwiasDO1jVYuge7CGIjNrY2sbCIlY1FINgIYivY2aUPti5ARWd8LzJc572JAbt/YCBz5/7zU4QADQ2JA5mhzBofKnxyUKHqV1Enf77K+yxorzQ96lX9z7Rr4YEyZhGp9yRzJ3MrM8pjX6CfQ/+KXYRHON+SOOQgw8/p/mf/BYKCsMEBknjV7LvwPaH/BEHBYUnmjbIBfE/oP0IqtPlQwRPew89D/7SwwIcC6/BfpD9OLw/9p/AfLKFdr38OPw/91wgKhHbHHApb8D2//Dt2EV7hP1hCuzccZvQW+j/sgnQ8Nns3ZxOTTdlDuvX5kFF35P8O9B+sJfMu82KPwjJS55JyZR/pdsYHQ+T/YZuDGdnkoMC8/ob/5QuefGJg3oHniAAAAABJRU5ErkJggg==>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAAVCAYAAAD4g5b1AAACAElEQVR4Xu2WPUtcURCGxyAipFBMBFEbMWUI6YQQSBGxVrAPIoHUFvkBgm0qDaRQyQ9Ik0YsNIig4Ecp2AlBsbQIBhKNcV7vTJx995zNrgrqsg+8eOaZc4/37N6794o0aNDgvvFFM8aSmNFMsqyBvyG3zicpTuQF+XfmHYwXQl0LrXJHNgtSnzzqBwl3Va5z7I3Cm/1ItQP3nWWVpNa7FXizXDs5Xw254wY1r1leEawzYOOh2HCOpfxEcpvKeQZz9jVdmnnNqrnIV3IY/wi1u5iUBx80G5dtObOUwIs4tfoI+thcpNN8JLUW6hFybebbycfbidcBZZt1MHmZ6tQCOe+8lXw/5yOYs85Syv/vWhgD7z8jn8Qn91DN5LzzU/L9lO+T4htA79T+xsvRmZXS43mtbnMxWXakmLBtde6AnHcq9dn/Mhcfb6g3Qx1Bb1rTrxmlnvNQineBSufx79PFIwe8t5qBW2EZeCLp4wB71PxmBrelGSYPfAO8DqjWXZBaBPXzULeY+x+Yc0Du0Pzj4FBPhNrfsnY148E7j6ToH3FDCt+UcCW80vy2RjP1es2/1Dy1cbXPQ8w90UzZ2H+NPeCzjXHZLWkWNW9oDlPJ/9Hsaeas7iiZIZcP4ErgPsDJ3gVym60Lvknx8gFwpaXu5bohXtJ1/a0CPGawSTymrsU52ZK8ikPdCCwAAAAASUVORK5CYII=>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAVCAYAAAAnzezqAAABUklEQVR4Xu2UPy8EURTFD0L8KUgUCoVKQ4hE5zsolRqVRqIjRCMan4BCo5KIhERIUIiKRKLQqYnWB0C4N/cOb868t/N0ivklJzv3nLNv7+7OLtDQYCyLTkSjHLTgi40IC6J28gZEQ6GhB4359b7POWgvpRXv3EayyvmPNGvhmjymC9a7F12KzkSnrvAFbnwuNBtkPwzSfIfIlsQqGw4/74rmLHZRPYiZYAO2+Ah5FzRnsYn6BZhe0Tubwrk/hl9Dx28cZx1W7OGgBamFj0WvwdwJ6+o9lKRYQMs5jCO9QIzik0iyhZoCUXsgUds/QE2B0O4Tm45mDxGvdP5MOAhv+PsCR2wKbbDsmfzKAp/hAAs3gnnKvZfAK5iDZTscOLE3ot4SG/oPpj+PD5TvWqUP1tkjX5mHZdscOP2wfFG05teHpUbANBuZTLIRoVs0zGbDv+AbukBfG5Gd0U0AAAAASUVORK5CYII=>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAVCAYAAADy3zinAAAB4UlEQVR4Xu2WPyhFcRTHDyUWE4NFPbOUjDIZxGxXMlmEWSlFSjLIgsG/YjFRSinJxmRQYlVsigUD99s9h/O+9/fuu08pT/dTp9/v+z3nd3+/d173j0hOTk5OOuNspPDBBrEscQ1ijHJ/nguJD37HCWJNyjfCqMpGgAeJD9/FCYf901mo2kaAtB8Kf0THLPzLRixF0Sq/34ghNogGNiLq2MjAcBTNbBr9Eh9+g3zwouNPGoFxIIpFndf4IgU+9gfrqo0V1YhV55vna713H0WnzntcvkPnLaoT8EUN71XaCK6Ffg94veQ9qu+B9o0wj+um1BtUjXmbm3sWSMuWJIvAZBTtTlfaiMuA59cfkjYaJfbrnZe1ERMBz4B/G0UtJ4xSC/nfq7QROwHPr2ftgY/bwmvcNp7Q+rRGnMr3GsRNUZY40nFUiheFIo0sB2ftgT9HetNp83h9WiMM3IrPEtfNUO6LVzYcx1J+EwN1+ABjz6+fJm30SdKH3g14XFeqEXjr8TNhW6jWLoiY9wniRMKbhEDdXsDj9dD7Ae8p4B04jbdP6Hr2sGQKkvRno7j2hm9Ek08o3VJcEzqA4V93vi7kGW/qneuIT37GzoDro+5Kddoefp+CfO+DZ9cZ5XNycnJS+QTApc9sKAavZgAAAABJRU5ErkJggg==>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAVCAYAAAAnzezqAAABaUlEQVR4Xu2TvytHYRTGH0RkoBSDibKYlM0fwGRUMposJCMxyMzIYDGJhVJKkkx+DAaDxWAgZWKkiPP2ntf3vM99+953NNxPPd1znvPc03u/93uBigrPvOhQNMCDDNZFG6JGHgjTKPqdoh5r/IgGtd7RPoc50bvpX0WPpndcwu9jRdxR7wLn5KUoLIL37BNfqBc0bmZ/dFF/hfRySwPSGeeNmf7U1NlsIb2cSf2c3J9Qn8UqiotSfKJ2iCm99kcJ4Fiv9jU01cZpluCDbTxIcIN4OXMgejF9M3yuxXgFwgFcuB5nog+t6x2CKc2toSQgjKKY2VOPfaY0s4uSAPx8gk1hE/G9rr41ffCi/SO2Ed6Qd4BJNpVwb/hUn8zMUTjAt23gh8umH1Lv2XgL6jH38LNAKuO8WTaO4D+PL8T/Wkc7fGab/Af1V+Bfh6uvowTQof6MaFHr/ShhGGYjk25RH5tEq6iXzYp/wS8dcWrUStKxRQAAAABJRU5ErkJggg==>

[image14]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAVCAYAAAAElr0/AAABjklEQVR4Xu2WTStFURSGV0hKoVAGZkyZ+An+ADFmZGxmIiP5BwYmYmKoRDG8RfE3JDI0UPJRWMtZ233PumvhHm7OrfPUW3s/e53dOvd8XaKKiopW8wb5V7CRok31UPPH/Dk1zjHnSFO0oaLHtYQ9zrSVP6Q0J9LFubOyCaITmeAscrrtQgH6OLM6nsQFJGrEQ2qvOSOcHc6ZOou4Th0f6BzBZxLXIpfYNfNP9jnnVgbIBtI4MqwekVtU3Ao425zQr27A+CsYX3K2YC7YfT5wpcMSxbWRR57Jr7MnaH/UdMVXjc+xQP7mHg8U10b+guqN2oYT25T3Xo3dQ569HNHmHl/VWj+lbhncozoP8ZucMc68WUPWKOjDlQHjFNda7+2L7h4XqL5mjxEiN2eFVxghtTfG3aofAufti07eesggZWveJ0D8ieMaRIP8Bql/4WzoOL21cK9eHT9Rdsskn2o6dI5EfYhP/zrWOa+c01wFZR+ZshCdSOmpcQ51PMqZgbW2Am/Ftr0agrxq03P0K94BzAuTHQA29rwAAAAASUVORK5CYII=>

[image15]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAVCAYAAAAnzezqAAABRUlEQVR4Xu2RsSuGURTGH2SQ8Ss7ZbFQNqviL1DyR0hWMchMWXyDgUk2ZVOyYjRYDBYpEyNFnOOe632c9+a8lO391em7z3Oe+3y37wNaWhJLMkcyo37RgE2ZLZlevyB+7H+XGbPzvukmLMo8kX6QuSWdCfuvnNbAmfNK1IqQPP4lVIf9HRbCOcrlTA/KGfVmnf51fxdBwNCMz7GedjoT9q8jCBgvqB6xYJ8jtN8zzxP2ryAFBvyiwCWqR/jS04KnhP050O8XDv2CZzuXHnHidCbs30D5IjODeubQvOxv05kJ+w8QBJD2c94UdlDdHaczU+ufYiE8onyR0f28Nw2+q+ew/40F0nKV9IR5d+Qtm+e5RtpltDvq/zSOZfpkXmXueSkMImV2nX9j/hrS36Hni2+JRNT/xaQ3GjIkM+zNAn/tb/lfPgABrW4ZfVRNdgAAAABJRU5ErkJggg==>

[image16]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAAVCAYAAAD4g5b1AAACDklEQVR4Xu2Wv0tcQRDHJwZCwCIhURAxhZgyiJ2NjYnY2CiksbKQgGBnYZcmELAxldqp5D8IadRCRAQFldR2gaBYphCERGMy3+yMzpubPc8fcHrcB4bb+czuvt27t/ceUZ06de4bXzjee+mY5fjg5RX4a6LqvKB4IWNU9GgvmfwqPKb4GlVhh0oXg7whcNflJmNvlV4qLmbO5QrcDy8rJJqvKrRTWsyA5LkzlvOVkBvXx/HGy2uCebql3W8LlteUFjMteW5TOe9Bn32OFo5Fjg1xlq/OoX1kcnU2Ig8+cWxflOlMImSL0sBvkvvJlZy3oI7NWZrFW6K5kA8590T8U+ftcfLzgOxmf1MasCx5tBCQ88o7ytdz3oI++OI9/rqbpg203ul8Ae2kZ3bYeU/OK8eUr0ce18UvgNqpfNrbUZmn4ng/V6s4G1nGqXSyaEDOK+Xq3v8SZx9vyPEYjEBthqOD462rKY2U3gXKreP821UmXa7ArXtpeEnxOOA9cv9mBrfLMeg80A34eUCl7j9RAa7L5I/EXQb6HDh3KL7JOOQTJte3rD2OUeOV55TqP32Bkn8QuAJTIu0ilDZKtR6OV9Ku9HmIviccH6Wt/8Ya4LO0cdutcqxwjLg+nnL+D8d3jgXJnxV6MA+9CMA5wGLvArnN1gRrlF4+AO606CzXDPaWrulfFeAxg03iMXUj/gF6irmP55VNSAAAAABJRU5ErkJggg==>

[image17]: <data:image/png;base64,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>

[image18]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADkAAAAZCAYAAACLtIazAAABqUlEQVR4Xu2XzSuEURTGT77iX/BfWChFslB2NrKymJUsZCE7pVkopWwsFLYsRTZSVpIiSdmINSsLJYR8nad7Th3HNYNmRrfur57ee55zZ+573jP3zgxRJpNJiXcnzxmVn5MEjaxnCgUMu5ySbHHKtlxLderRG6mhhT3JuMnkQD+rx3nJYbsX6+aLi5OjnjVl4liRPk6OLRd3Uyhqx3h3ZpwksS7ZbmI/dphcksSK3KTg97LeXK5WrHnjr+AUnfamoN2MPYRaULF1d71hQAex0I1PUNjHyE1IvMKaZy1KvMpaZo1LPEBh/pXEdawL8TopfAdPSg6cSG5dpOCUh39svLKUelq4EeTbnG9fc8Rql/Eta8Tk5uRaYG0YXz/+rfT5vfy9lIrxEMqCF3jFiPnwBkWjrGuXA2PO0/mQzmk2Y+DX8vGreAvOrwp+cYvm7I+H7+bj+/k3RYI+1j3FcxXFL3BpxjOsc1aD8bAPiyaelWsL/axIPWVtfs+Mq4J2AP9WTl0O+JsF2Ic4jAqsLgqn+gOFuQesQxnbHx2Ih1j7Jl6ir3s5k8lk/ocP3m+Dxm2t6KsAAAAASUVORK5CYII=>

[image19]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADkAAAAZCAYAAACLtIazAAABxUlEQVR4Xu2WPyhFcRTHD1FKGZRBma1GKSkZFBYhg8EkFpsSqTdLxGSxsShRJkkp8ShikcJgkDIKWfw9X7/z6x3H7/Ve7/WGe7uf+nbP+fx+713nXvdClJCQECXqOd+cZjmW/V2OPuXkBvNMcz5VHwsw4JTq+8TFhlX6P9BywEUaDGMHCrnI0kBumBbjYzXkDWUGsnlW+yJN6I51iKs1PrKEhgy5QtiwgsKu5GCY9YBbMa4QQhcq5EoOTjqu+hlxnh3Ok9T7nC9OZWb5978kOHymX/kLcZuSbA74v8kPyp2KG+Lcizsmdy6QJvc+yYtHzq7qQ1cabsn0uh6T+p3TaNYs1g1ztlTvhwDYiwtqz9cldYrcTcgLfHBOjhVmDcBXq/6KMlfXU8c558wrZwcC1qEfULEDWbTr5byovijskHviwB3nUOptzoLUINcPGeo1oTXtujmvqi8KOyT6QVV7zjiLyvmjfqNah+cwJTWYVXWuIXs4b6ovCnwxfhXbOSecW7M2wenkNEnvn1HUeHEcSZ/N4TlcI/d8toq7Jrf30m+SGg4vnDbOh/QHak/B4Iv0nYwlGLLGyjgxyRnhjHKqzFpCQgn5AYjGkguWRvYDAAAAAElFTkSuQmCC>

[image20]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIUAAAAZCAYAAAAffu0EAAAEF0lEQVR4Xu2ZXahVRRTHV1qGYfkRGih2DyISEilFKRZc6MEwww/8eFNu2LMQFGQQREQPvvTUW4pPokQlZSAK3isVgaLgk0Q++IlpRhqlkInOv71WZ52/M3vvc86+t5vMDxZ71n+tmT1nz+x9Z+aKZDKZTCaTuc9YGGyExT75IViLxX75JdgdteFgt4Nd1xi00eZLKe7zgl4fCPZjR0Yc6/NY9LEJ8Luq+rpFipyDwQ5rebpey6iKd0XZQy2LNcUsad9jpZbNPrWkEs7L6PexKar6+Z3Ec+qOQ52cSqpu9oyUx5sg1YejLCTYJ/H6440VUt3PVPy3YHtYjID6L7LYDXjoaGQtB4hUR5siNSnq8oX0V3+sQB+HWHR8Jenf8Q0LCTZLuo1a1B2MVM5zwZaz2ANl/ZjEQoSySdEKtoBFx0OuPNGVY0yQYlBbnXIHa1hwpPpoXJUiB2sKZjILJVTdp5SywShjnRT1Hg/2oJax+jWsXdhAsIvB5gX7SzWPzzV7zZXfa6f+w2rVt0kxODeCHVfN86hqmLgYTJQ/cXF/v5+kuM8y9Q+4PAP611p+Q30P/M+1bIPLxDTPYuns15/Bnu3IqAfq1nmZotjNu2FQ4nWgfez8paqddRqAhgFjLdWmnxS2IMUge35V3QP/eefbJPHYfac5bYdqHvgnnc+TO9Z/+Fudv1G1Kr6XdnveugH5L7NYl15vGKvDOmZ4Kg87DNZSuX5SpPKwdfX6EfINaDgj8D7nvU/aKvJjIP56RPP1PiK/Dnul3c5jquGLWwU/t67gjqfY7sqpOvzJfJp8AxoeNGup3F4mheVdiphfVMfae4e0WI4HK33Er8i994IZOzWvW+ZLUW9I/TptIGcXi3U5J0UD/OYyf7ty6iH9IZ36U+Qb0LAuYC2V28+kqCKW9xZpOMTjHM8cKeKvcICwA6kUVTG/IK4C+W+y2A2xB8PgwRipfNZT5xvQeIXOdQ1ovUyKsgGY7cqx9t4mbVD9RU4zntAr4jh0YvyflNRLAh6RdGyTtGNYy7zqYimQ/xKL3YBVKhrxXwMPd9Z2Gwy0lvOXqMZA2xDRUrn8txHajIjG9WO/CQdAnli9dyNaLO+YK2NXwvGZwT4kjXOMbyUdgz5Vr+ZXUSenFvbDT0vxttjBVgyb2dhq/q7lARe3trydiWixXHyVbFHGuWBA/RPBdkuRb18KmJ9wmBTQMIC4+u0dt28vh7dD/2a3dxwjel3vYuAD1X8Odk2vDOIPsyiFjjMSXC9Isd0eVn+u5mBi4Ll8pn4K+x2N8yQLmUa4KfEzkCnk408Vb7tBncHeH+wyi5nxTZ2BTWF1yxa1/bSf+Y/A1hX/n+gFHATeYtGBRekpFjP/D0brbR6tdjNjRNMD2HR7mUwmk8mAu/l3lmiwtt+wAAAAAElFTkSuQmCC>

[image21]: <data:image/png;base64,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>

[image22]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAZCAYAAADe1WXtAAAAu0lEQVR4XmNgGAWjYBQw7AHiPCD+D8QzkcTloGIwAGIj8/GCLVAapOEfkvhnqBgMnEDj4wQTkNggDepo/I9IfJgYCCihiOIA8xkwXQHiG6GJXYPS6GqxAvTwMkDjg4AbELOjieEFIAMakfg7oGLIAMb/BcReyBK4AEjDejQ+sqEcQFyNJIZuIVYASz5rgPg7EItA+aDUABJ7AVXHD8RtQLwayqcaIMqVpAKYoe4oohSCh0D8G11wFAwhAACbYDCaQMwnUwAAAABJRU5ErkJggg==>

[image23]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAZCAYAAACsGgdbAAABSUlEQVR4Xu2UoU4DQRCGB4GoBEV9EyQCUwS4Cp6hb4HAIpAgeIAmOCSkCUldFcEgKtqQEBwoHqCuAebPzeXm/t4ed4C4S/ZLJrv/zO7cn727FYlE2kFf48ui8cDkDSebRitO80xaYBLA5Bsnm0YrXvlAEpPbXGgS6UmGTvNUktodF4h70hONSwn3rQwa7NtY1gxGy0zuyPr+VI9I1wKbLmyOVw19nJVznEi5ySLYFOsfwYbXgpxv1NH40JhK3uSTJOuGGu+We9BY2RzcSrIGY9fmqd5164Jg8ScnlWfJTG65OZhJ/iRR27TR5zxeH5EuhU+LQe3axj2Xv5J1kwznfm2yKmjYcxomx04XPZBzIZMbLv8nXiT7qQBM+iuGDQHOeX3gNHr/G2h6qHGu8Wga9x4egvkiWypzy+HbBUvT+MlSoEO3RyQSqcs3yH5k/2oisPAAAAAASUVORK5CYII=>

[image24]: <data:image/png;base64,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>

[image25]: <data:image/png;base64,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>

[image26]: <data:image/png;base64,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>

[image27]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAYCAYAAACIhL/AAAABTElEQVR4Xu2VvUoEQRCE29/kEjHUzMDAwFQwFYx8BVNzQRAEMTMUAxNBLvEBLrx3MDXSRB9AwVz86eamsba2Z3b1EoP5oNjr6t6eujvYFalU/hdfBX2oln5GG8yoHtgsgHv/RHTzfMY33L/hRoGRxLt6kQtyKRP/nhvKHRsdnEh8Ri9yATck3/stRzLFnlyIfZn4r9xILLKh7Ki20udd8A8lPqMXuYCRvwf+KfgX0vzbP5McDug7ojNa8LBrHYcIDhgdUgr4rLqFukj0Ld4DD4kCmjbBQzDgi2obep1EAQ3z8FdAOOBK8lCIB3RdNdtlooVGzjc4oDNQjaV9rwecVV1TrxNe5uR8gwNGc+gdU13a3SI37P5Cqh+pxwHtFYjgzjOqDauLD3wPgHqD/ir4c+l6Dp7LsKu9v59Uw1QvQw91EHhTs8ZGpVKptPkGUemXDj+MxwsAAAAASUVORK5CYII=>

[image28]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZIAAABsCAYAAABAbTQnAAAMDElEQVR4Xu3decw91xzH8WOtNSVUhbRBkKiQCk0T/ME/tOUf1ZJq6leikYjELrEnDRp7aAQpDaoRLVWVWv7gKRqU0pD0D1v8NFG1RO1FbfPpzNc9z/c5M3Nm7szcuXPfr+TkufM9s5w5zyz3zsw5EwIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPVeU6QfVp8vKNK/inSnVTYAoMmJibRr7lek/xbpP1FMwwC2gz+G7eJxbKN0wPRpaheG1bK/VqSvRmmvSF8v0jeLdF2R/h2NO0SZb1/9jedxTNh/UgEwb/54sM4xAT3MpcLtn3/IZzS4axhuo4nn8Y8iHR8N5/AbcVMak19WnH4ajQcs2dj7GZw5VXjfA+0fQvlLpq+TinRTNGxl+FsUy2Ents/6jIrybvbBEfwupOvxolDGH+0zgIVJbf8Y0Zwq/LjQ/2TSZxpzS5GOjYY1r3Oj4Vx7oZz2dj6j8vgine+DI2iqw6Y8YCnYxic2twq/IZRlOuzi26DtIK3LZSf44AiaytGUBywF2/jE5ljhdrDTL5RtkjpIx8PPjD6P5T6hXObpPqNwRSjznuMzgIXx+yFGNtcKTx2U5+wuoSyv7kOYR1WxKf0gpJd5cijjL/QZwAKl9gGMaK4Vfk7YrpPJVWFV3jjpEWbvIT4wIL98S++IR6qoISawRNty3FiMOVe4WpirfJf4jBlKnfT2inSEi4kfr8k/i/QrH2ygefs2MFdVce9WHwAWIrW9Y0Rzr/DUAXqOUuVsG86Rmm8da6Gfuj+i+Ad9EFio3H0GA5l7hfct3zqXbV7pAy3uHspyfsRnRD4Tyv679AvjFJfXxFre5/hRSNfXU0IZf2c1fFQ1DCwV2/fE5lzhurR1Bx/M1Oeyjerit6G+QWGda0J7Pca/LNrG7SteRswuEeqGu5xapNeF5hMfsM1S+8HgJlnIlphrXVxdpCf44ATUQr7riaTuAC73DmXei4p0ZJHeWqRL940xnLpyWPxh1fB3qmFgqdbavn8fyhnoZuNl1effVHl+xn54jj7gAyOYYz2cFvrfYF/3sk2XE4kdoHOSWadsdfyylNTxpHlsFdO6PSaUfW6NUY6hzLlsuZawDtusV/3rergm/LDPKDw0HNyZZa9In3OxOXm5D4zE18um6X7Dn30wg62Hv2xzcZXXlGI62F7uYkOy5T11X3Qa9y3SPUPZk/JLw+pS15z4/4f3dh+YsbZ16eu94eA2nNqWd1nnurDWug/3GZG6Sk7F5mKqsk21nFx9ynNe2N/BYp95GJ1ItE2N5Reh3/2bIeklXkeH+d0j0esCUp1vPrFInwr1+/Fc7YXxv6xuW51MpVOdWMvhz/sMR+PoGrWn+Ct8cCY6VcQaplpOjj5luTGU090jivWZj9GB7EofRLZ16r5uWrXGV88Bdb0az9nY5eVEktapTnIrsW4cXcKoy9s0XZIx2onGMpf1VzleUKSzi3RWkc4o0rOjdGaV/6Ei/awaP05m3cs2OpF80QeRre/29OLQPu22nkiG/rKqy6J++1fSe3RQyt5O3hDKka/3GR3Y+yM26U9hdY/HxO0Y/IFyaOvMW08hDcFO6H2T6tCsc9nm2rCa57ddHvKo7vrQdG2XFLfxRDL0l1XbPlPD1iBVbZZ2XXadWwXWvfshV84CvxBWy8tNOWw8u3nm42KN3cbSNO+mvG+FMv9ePgM7rWmbaaLp7uaDziZPJG3LVb5eA+0N+WXVXjOtByaMP97Y8JhXMbZBdp37CuxriHn0ZR3p+XXxZfLD3htD+zh16qari8c0ziN9EDstZ7tJyZluUycSXSb9hA86fh+O1cW7Si3Dx6yN0Kej2C7y9VTLV2AdtSdpkjOPsakMD4iGPxp9lrYyWl1Yg7Mu6uat19fGHlekB7lY3bQm5wRnZSfNJ62j7/Q5023qRJJa5sfdsN5+qSfLUlLTezmdc9r/J/7l5v9nNnz/KLaLcur8Nr4C67SN05Y/tveF/WV4SfRZdOlIN57bPNAHMqXW//k+EMrx3pKINbH/UZ8THObtrzVJ/28fU9Ll2yZt25J0PZH4MjSl+Iuc5w/wfwkHy6EHRO7sYsaPm9LleBaPFw/rMr8+6xHzXZdTl7dRq2+N3NSpnTqxa5OzQN3EelXHlEt9O/kNI+aHh5aa//U+ENLjpa4Je31PcNhOqe0kR850XU8kQ1ED15jK8PpErE5Tnmk6jnnvCuU8b6r+xkld8iCvzv/PKi9FT9082QedZ4T66adiPbOaus9jSS1Dsbhdhn4m+/H8MCB9t4uc6TZxItEXoZtdzJdBry7W04J1/PhDajoGxi4I5Xi3uPjPq7gdK3VC+3EVU193fy/Sa6s8Y52Afi+K6TXSiv2yGu4zHz26r5icGMrH/PVr0Xw3lN1ffSyK1cmpk32sItWy+XlF+lI1nEMr16c7jqGpIz+V+SehrPwbQvnzeQqpurIbdmqPcbj6bHX83OqzruliRY9w28FEO612CHUbv2tS21MOTdf2TvtNnEhEy/xkkc6tPlvSLxX9z5vKNPaXVStLEz0e//Tqs8a1A3o8ndpovaz6rMt8cV7d5+uqv4fC/v7p7MVqXecjcVzztRPJm6N4jrY6qfXg0P1RVC3sjj64QanW92Orq3DbQJXUlbu127E0NxeGVdnUqFCvuLW0F8ruN/SNRxutPUbp0zrsGf747YTrznMb9V1nfXmqa1Dn/0+WTohHGlG8TGufFMeamiCM8WW1a19bqfjbivRrF7Px9OhwPE382fad90cxDZ8epb7zkXicp4XVF2q9nlp53w9lk4g2qXUehU46ky0s0ybKs4lljkXronTIZzSw5/zXqQe7vh3P45hw8JW3bawcOWmu+pbNTsRLo3Xa9JfVVL3qqkPckFdsPH1xjKfx06tlvX4pWNznm67zkfizfkXFl7b0C19fDDXOI6J4il/WaLQgHUTmZLKVj2ximWPS+vRZJz3unOowsIt4ufp2fXw0nMtObHVd2SvPX7Ofk2f5QAdatyXdLJ7Ll1Vfhj+G8h5oHFcjRxv2jSjrPn+j+qv7Im+K4vq1I13nI3FcTTf0i058t0VtPU/4dR7Fu8PB58DnoE+3HuuapMIndFwo16nPevWZxpwUyqdojM0r7pU4x14op627XKL2Cuf74ELM5cA7FK3LXL6sqiyHivSVKPaeUB6g4/s4eoRZ26yGdbC+pvpsl5j0Wf3d+fsf+vWtRptahnpr7jsfvVNK5XlSKPvYU55ONF+uPmsbie+p1JlkO8q5678rJqnwiel6u9brsIuPSU/DHBsNa/m6OduVpmv6n+hXzlT3Bjbh1WH1jXabzfXL6q5o2ocwgqVWuB2Q9Qtlm6ROJPFw25NNS3CRD2whvqxult+HMLIlV3jqoDxn9pRLfCC1d+4AyMc+M7ElV/g5YbtOJleFVXnjpCdVAOTbln1+MZZe4dZ69hKfMUOpk95ekY5wMdFz9QDS/H6Eke1ChacO0HOUKmfdsI8DWGH/mNguVPg2rKO9wKzpEXC9+W4Xu10ButqGfX5Rll7hurSlFrZ9qP+svuLXJeew5+ybWL76OTslzgCwT9u+hIEtucKvDmXPo33d6gMZVJ96NUBdy/Q6qctaRq29lae+2Li0BbRj/5jYUiv8tLC5G+zqaiX3RGInkJwkR4ayt+hLq2EABy31uDZbS6xw3W/o0+Oq1cVR0ec+upxI+linbMAuYB+Z2BIrvM86nRdW/WKdGsp3TdiN74vDwV8HPsV0IrncxYZky1PvqQAO8vskRra0Cu+zPjeGcrr4rZB95mN0IrnCBwekd3L3uX8D7Ip19l/0sKQK17roTW9nF+msIp0Ryh5ELZ1Z5avXUb3Gs+lXhR/uQieSK30QwGTW2X/Rgz+Ybus/QJeS/Hp0SfFLfvQmRb1m+OQo1oVOJP79CQDG4/dnJWCj9B7uo0Nz48A614bVhtz28h0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwIL9D5FcjNeX/HsQAAAAAElFTkSuQmCC>

[image29]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAZCAYAAADe1WXtAAAAtUlEQVR4XmNgGAX0AJxA/J9I7AbVQzT4xQDRiA1wMeCWwwtgrsEF8MnhBFQ31J4BoikFTRzZIJIN/c6AqekiENehiZEEkGMYGVMEsBmCzoeBSnQBbMCFAWJADJo4sqGg9KkDZf9GEscJ8KVPGCAkjwGweR0ZFAPxWiAWZcCvDgXgM7SRASEXBMTVQDwXIY0KYNmOGPwXqgcEcFlOEaC6oceAuACIPdElKAGXgFicAU+YjoJBDgBQqEO0FElDAwAAAABJRU5ErkJggg==>

[image30]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAZCAYAAAA14t7uAAAA0klEQVR4XmNgGAUDBf7jwXeQ1JEF3jBADEIHixkg4nroEsQCmAuxAXxyBAE+zfjk8AJhBojGUHQJINjEAJGLQpcgBlxkwO4iTwaIeDq6BLEA5lV03I2siBwAMuQfmtgBqDg6UEIXwAXEGHCHL0h8BhYxosBNBuyK3Rgg4j3oEsQCWHiigz8MEHFQBMLALyD2QuLjBbgMhomrIvGRaZwAphEZyyLJG0PFDgKxIRDfA+I2IF6NpIYiIALEvFA2QdeSC2AGu6OIUgE8BOLf6IKjYIgDAL0mRbhKqkuOAAAAAElFTkSuQmCC>

[image31]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAAAYCAYAAAC/SnD0AAAB2ElEQVR4Xu2XPyiFURjGXyRKym5wIwNZJCZlUxaDQuwmG4NZKZvdoBhksPqTlJVSiCSLSVHCQBZ/38d5T99733s/3XPrLr7zq6fznuec3u+7j+/c+yGKRCKRbPGdonm9KVIcH1YkgBhaiVSxvqjwaELdal9EOCYXTqPM7ZNm55mnjVwgH8qzIXXK/FF5meaMXCCbyrOhpXmZpZ8KA7Hzdpm/Ky/zPNPfodl5RGilJBwvfIdhnFP7IimU+mS1ULIXoXv8cX5T3ha5PwJebZZYn6x6tY5fcLzyrCkP7JDrNSvz0D7VrGtKPs8+60lqMCRrd5R/v8GUElqOkj2TqsY73bbUQPexfX29oDyN3oswepUf0qeZiu8Hl6ouKzR/M1bF/veEP2JNyr8hsM46lRprg2rN7/VfDSeshmT51xsVTbMelB/Sp058j63xujWhvIqBi3VZkwpDW1EexgG1pvfWsg7E6xDP9vKE9gE2KA2eUHg46hVlg3Wl5v5o3JM7rp5X1rjUaR92V3ngSEb74W5lDO0D0kIbU7W9XkV4Ya2SC6VP+bj4DGuRdSgeRvg4Cj2sG5lfsPakbqLkKIMa8adY5+KV0wfAz1HyFPqAMOKoD7OWxYtEIpF/yQ9hpL3/X9HwMQAAAABJRU5ErkJggg==>

[image32]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHAAAAAZCAYAAADpG6rZAAAC9UlEQVR4Xu2ZTcgNURjHH58lspEV9YqkpCixkJ2V9btQypqlDclXEhY2SpEFhVfJQpGFUj4XspEoOzY+d5TYEeffzOk973/+Z+bM3Ove6zq/emrO73zMOfPM3Pm4ZplMJpP5z/jl4oGLHVwxppyxYr2/ueJf5QeLkmUubruY5IoE9rq45WI1V3RggYvFLBM45+I4y4CxTiAW96rcXliW50xX14K2a8vtK2W5LStdnLSiL2JiZnUte2zmPrF9Nyh7usxrJOEE7rbq4k4LpwgTH7qH5Jo44GJTud02gWg/WzhGuYEz14qJ4D72xMVNF1MuLoaNGuAEYjy1OOUYtFlC7lnpu9ImgedN7wvunXBD5ZSLLyw7oBL4nhyAx5UYY5vpg3LBtE+lTQLrTj72XE6iqRPqcTU1gfvSJ5YdUQl8Tg7Af2QZcNn0+vAgoXwqI5PA7S6usSTUjhQpbVJRCXxKDjTN7b7p+kNWeDxNdgF9V7CMEJuj8lxuRHW4SuUtLm6QU6ixutKvBN4zXe8TOI8rEkHfVSwjxOaoPJcb+Uzl71YdZJeL+eQU6IcDXxepcFuM/YIcgH/LMuCsVdcDTpj2qaBv6vukShRQnsuN4EwMwQCHhUshtV0KKoHfyAH4gywD1pue13XTPhX0XcMygkoUUJ7LteCrxldyPMBOq75DxcDP7CyWHVEJ5LkB5Ri0wW0gBOtO6RsDff2HgSb2m94X3GPhWoEOOBv9U5kPXJlIXNsB27aPwQncbNWx3wjn5x++NOMJmp+i0eaIcDxeDLRbx9KxwYq6D+ThUOfBLUntS7la/KQRl4TrckWhX933vhQ4geClFWMvcnGs3GZwP1Qe7o4Vn95+mn7d8WuOER4XDo//xMcfLZaXfqsVicc23lGZuv0PFCT+tVUXmnpCqAR6Un+6FBtZEL2eeE0gwUtZBoxMAnulLoF/k2EfwGHvv28MI4H4t+EoywGTE9gD6lPdoBmbBPp75j6uGFMe2fSaM5lMJtMf/gBY8wP9mMFa3wAAAABJRU5ErkJggg==>

[image33]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHAAAAAZCAYAAADpG6rZAAADEklEQVR4Xu2YS6hNURjH/xERSskEUxMJJQYyWKVMKRMGxmRCkkJKwoAR5TFA1wCZyGNACpmIgefQY+I1oZTHzGt97bVu3/nfb++z9trnnnty9q++7lq//Z111t7/e+8+ZwMtLS0tLUPGOl/3Qg0Lcq5PfU3mA004zaJPSIBl7PB1zddCPpDASV8HWWZylEUC831d97WBDwQcehjgThZ9pCzAv74WhfGFME9hKzp7ZXxLzVNZ7esKitenvndE+l+G8Yww57Cc4bKpu8FeYgWoL4B298lZSN8kw9Vli69pvr6g3uvlddwvf8HsHAYkwHiCz33d8HXJ13nYwVhYfbLeHHKPgq/iFOwece9YJlI3QOm1+tk59DDAi2osv3Wp8KZy4ADXwF73DGyvqbp4lk8hJ8D3LFF4fS91yAjwm6896NzQLjWuc6Kpfd3gAEdgry0fSCyvKdt/mU8hJ8AnLFH4j2ruUDPAuInjaqy9EG+43djoaznLTDjAu7D3sA+Fn84HFGVBlfkUcgJ8yBJj9+BQM8Bj4ScvxJvjuUVKTyoc4B3Y68cAp/ABBZ9bpMynMDABRmSReWo+osZCymal52eXujraXQ0HeAL2Hg7B9hq+SJEyn0JOgM9YovBv1dwhI0C+ONvVWJjtaxM5C+t/fC4c4FLYF+wybK8pC6rMp5AToHzWYMTvVXOHjAA/o3MzvDGeV/GYRSYcoCD7WEXua/BV7IbdI+4By0RyArT62TlkBLgW5QHyG3Tjtq8lLDOwAvwdSiP726/my4L7oJwgTo5Fpgan2RzcH/IWVQHGsPSDg5XBad4YziEjQOEIisVe+3qF4gvuj46OdOQRl/5onIMVoCB7vIniJH/5+tR5ePQT81nyC4KXR2GLw1i+W2pmBc8XVROPc61QPXJPs9Z4gcLP9HUgjBmHzAAj21g04DDGnmhqsGUBRnK/rkjAc1kS1oXtJfFZroVDwwDHe/OpdAtwPMl9vNYLHNoAG/GdRZ9xaBjgORYTxEQFuJ5Fn3FoGOCgIAHG++awEM/3vwiwpaWlZQD4B8eA+UwHaG3VAAAAAElFTkSuQmCC>

[image34]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVYAAABPCAYAAACwAe1kAAADz0lEQVR4Xu3cy+t8YxwH8MclkY0NRWRF2drYyUISG8qG+Acoyi2sviKRUmzYyM9th1zKAvVbW0goC3aKFCu3XHJ5Ps1Mv+d85pyZM19z5me+Xq/69H3O+zmXOVPn+c6cy5QCAAAAAAAAAAAAAAAAAAAAAAAAAAAA0PVxDib0Vg4A/uuuqPV3rVNzx4CDHOxAvD6AvfJorb9yOOCbHJTDD3wX1fo9hz1OL7PXCLBXxgyO7+Vgbsyyfb6tdX0OBxx2G8AOfV/rtBwO+D8c1LGPV+cwye/D67W+qPV1rTdS3yrxCTSWjfXFOdT7u9298raBHXs2B8n7tR7P4RpH/cC+tqzfx77+vmysTZZ9u9a5OQR24+4c9Fh1QP9Y66EcVsfL/lyhvqzM3oeh6hPvSX5fYvr2NJ3lbOy2L6n1x7x9ca2ba/16onvJQa0bcgjsRj7Qs+i/M4eN6L8lh3Pr1r2vFvsVfx9u8vgU2+rb/75sjDh9cN28vVhHnJqJC1p94lvIlTkEdmPdgb6q//yyuj/67snhnmv395w0neW+V2s9NW/HOetNtOtq26807daHZfwtYcCWxcG+cGbTDnEFOg8OrbjxfVX/m2V1/y5tY5CJfcnrWbV/ue+qMvskGVf3N/VnmQ3kH5Xuet9p2q28bWACP9R6sHQPuHubduT5YIwBIGdhMW+u7KzSn+/SL2V2LvLSWi/V+q3bPak4D3p5DregfU9va9qtsffZAoe0OBCfbtptHs5O0yGmP0lZK/pvymGS19nn3bI8SK+rMWK+fFvT2GW3ZYrtxa1X4fNOesJBWf5kDWzZk/O/eVDKB33f9AspW4hbefL8fcbMM4X46py3/UGt51K2C0/kYGJ35ACYTgw0FzTTx5p2yANRTD+SsoXPyvL8fcbMM4XFP5FFHa91SmcOgH/pmdId5O5q2iEujMQ5wVbMH1/T+ywGrHXGzDOF2O4DOQTYpu9Kd5DLA16eDpENXcGOvlub6Z+bdqtvvdl5te7bsNaJ7V6YQ4BtuqYMD6xDg99rZbivzYfuybyxDC8/tdhuXKxrxQWdk/V6gCPqsTIbWL4ssx8D+arWT505lg0NRJF/WmYXieK2qj5xm1M88nqyxGuMX5h6ed6OvwCTaJ9nX2doYB0jlo1fZgI48jYZLONWoaHzp6use9wT4EjZdMDbdP4QywydIgA4cp7PwQibDK7xQyPx+CgAK5xRlh8PHfJiDgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgOn9A7p/5A4iOZk7AAAAAElFTkSuQmCC>

[image35]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAZCAYAAAAFbs/PAAAAcElEQVR4XmNgGJ7gPxQboEvgAzBNRIMpDCRqAAGQhgvogvgAyc4KZ4Bo4ECXwAdAGn6hC+ICixhIcNY2IP4CxCoMEA2mqNKo4CQDqql4bbnFgCn5GosYGDxhwCHBABEvRhYwhwoyIwsiAbzOGgX0BwAHTyCbAwwJYAAAAABJRU5ErkJggg==>

[image36]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAbCAYAAACwRpUzAAAAbElEQVR4XmNgGAIgAV0ABgSA+D+6IAxMZcAjCZLAkMwD4gKoxGUo2xQmqQ3lgCRBbBBmhEmCQDBUEiv4x4BHEiRxDV0QBkCSkuiCIIBunzsQi8I4hxhQJVHsDkESANnLhiQHBiC/NaALjgQAACAjF5FHYAkLAAAAAElFTkSuQmCC>

[image37]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAYCAYAAADzoH0MAAAArElEQVR4XmNgGAU0Af+BeD+6ICkAZIAMuiCxIJQBYgDJIBuIC4D4LwPEgGIon2igDcT6DBDN16B8ECYZgAwQRRckFgQzYPc/SOwyELehS6ADkEJ0A5D5UUA8EYmPAUCKZyPxV0PFYEAEjY8B0G0rRBNjRONjAJAkExAbAfF2BkjUomtA52OAyUAsBGXDohUGuNH4RAFkDY5AfB+JTxRANoBk22GgnYHC3DncAQBefSfGxXK27wAAAABJRU5ErkJggg==>

[image38]: <data:image/png;base64,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>

[image39]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAAYCAYAAACr3+4VAAAB30lEQVR4Xu2WzysFURTHD6KwkrKnpGwoSqyU4h9AspA/QJKtWEjKhpJiYUGJ7JSdH9lYoGwoKQspKaWQDfl5T/dOc+c7Z8y8GVG6nzq9ez/n3Dv3zHvzGiKHw+HwGVKxoaIaEwmYVjGjIh8ThiYUilUUyKeKAZQZ4T1rzXjZzJMwqOLBmt+quLTmHrwfRlGgIoIy0sUrmEgB73MiuD1wEtINYYffrN1gqjMXkF58jIkc4PXl4A6M/448kmvYdYC7gnkmPlTcoYyhjeTDLpDsEe9bQof8aKMejypeUUawRPLBxkn2yAv5zfaaz6pAhYYb3Se/tjOYzgZv2IwS2CW5oRHSvhgTAkfkNyDtxaDn+Ta4nOFNzlFGsEXhQzBeo4WYAPhGPZtxXLM2h5SsLkQJ6YWbmIhhluQLTpDsbdopXLNuHHpkjHRNDSai4OeBF0xhIiF1JB9qjWRvw/kulIp5Cq6VGp80rh98iFbShX3g08D7tIC7N/47ON+D0hDX6I7gQnBBI8oMvJuw4WuMWvN6464tN2wcckY65/FkjT2k5n8Fvig/3/wC8qbiJpimUtI1i+AvjOdnjn/GPOY/GoT9nIpuM/6TJm0aUCSkQkUlSoG0+/9vTnMIfvl3OByOTHwBu96TIpT4GP0AAAAASUVORK5CYII=>

[image40]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGYAAAAYCAYAAAAI94jTAAADGElEQVR4Xu2YS8hNURTHl1fymCkDBh4xQVEimSBFmUkiY0UpSaKIJCnfgFJCGVwTMvMeKJl5RWLAABl4lBISQsT+f2dtZ93/Xfve891z9VH7V6u713+ttc9e59xz7r5HJJPJZDKZwWVLsHPBpnOgImuCXQ42jQPKxGDng63iwCBRp99DwQ4HG8qBBL9YqAoKZ+j4lPpVGSlF/kz19wY78idagPhDHY9Rf1gZTjIk2EIWe0C3/W4O9sH4b4I9N74H5q46fxP2pFntOmkp+KC8kA3kgz5H89gWbCmLNanTr7dmaKk754S0no/KoGgcabdU74R3UNwt84zv5QBPY5DzNy5MN/3i7vVyoC1nUXkn6f7bgqa9ouPi6wxyLrBIIOcFi1LouHNSoNkqF2ZusGUsJuhFv5zHfiTqXk1HGuIX7RNft8ySImeTfh7Uz0c2SbV7pAHor1hUvkvZkDULNhHQ8O0fruObTRmtNKR1HlClX/BNyrWs08+pTRkFB4JN0bG39o5cE79olxT6KA4Y8Pz3Dgr/Ivk3jB/xahnEvTtmkfi10LBbSlGn38gdKdfuzQW+mHG7vCRXxS+KCx3BAUP8lj0hnReCca8vTKo2pUfq9AtwYb/qOB6L5/N81jqCH2qvaL/4umWxFDk7SOeFYHzf+BHoz1gkkDOQC/NWfD1Sp1/8jnHOWdWivjHYnDLcT2qtbZktftEZ8XVL3KVsJ50XgvFH40eg72SRQM4KHU8g3VvfJ/H1SJ1+EV/NYuCYlLVxXSm7pHmVQAH/iXuveieQc9rRbC37EU9jkLNSx+tJ9+pTuqXbfhFfy6LSrrbKmlx+qlkw0W5H4wM8djT4d40/XzXLU0fzQM5RHV8xetyFMdAms0hU6RePI2gvjbZVNQa7UMRSeOetMijETgqvSX4Ee90c7id1AGifgy3RsX1lEXkgRWysFK9svHk8GlLk4qLYkwRGawxbbjwqMZ7UlJGmU7/xtdFJ0rHRgb5HiscaxrebMkri+bI2oEeZBX/WumUBCw7x/dS/Qrf9jpfyf0omk8lkMplM5r/mN9UpLvqtchYBAAAAAElFTkSuQmCC>

[image41]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAAYCAYAAACr3+4VAAAB4UlEQVR4Xu2WO0gdQRSGjyQKwViIpTYWNjaKgoWtrZ2lhaWVYmOjSILYJFZaiIWFVoKVj0pB7CRNEO0EBcFHJE0gFhbG6PzsjPfsz9l7dxe51XxwYM53zs7O3L37EIlEIpEKUy62XXRxISdfXCyxVLS72HExwoV68uKi2483fJ6XLUn3/1PjAOpnftzs8w+Vcn3Qi9DuiJzFoqQ3OebzSeXGvdN8N1wpZiWZ6CMXDNDXRu6H97VAzyi5S8rRY81ludzgHsMELVzIYEjsE66K7TUTUrsHoOeapSQeV7YQ55Ic2MCFGqyLvdh5sb0mXKkOF79c7Po83OsBuJ/kAPwtyyz+unhiWYBDsTcU/vqfuKAIG71RDv08H/JjciAcX5X/Ln6zLMGB2CcLG23kgiJroexLbxRFLPA9WBb7ZAtie03WQtljfKLyADw/uEzQeMGyID1iL3ZTbK+5F7vH2ihuMQZ+hmU1Hl08sCwATjhI7o/31WgSu8faaFZfKa4kuXeL8uxDg0XMqbzXO/3gAXArKsfXDhx+hMCAdxr8E9kVZl+SSYp8YqF/T5Jj8Al3ly6/fbatkcfrDP6bi2k/Hk51JJxKUvvs4qsfvxt4cvaxrEE/i5y0uuhkacDv2EgkEonUnVdu5I83Fz7A/AAAAABJRU5ErkJggg==>

[image42]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAYCAYAAAC8/X7cAAACEUlEQVR4Xu2VP0hXURTHj4ahlC1tGRiFSiI0hKGtDdKsc5PQ2iiKJJJLLiIEOUg5uYnRFkSbuoRk0ZJBoRm1hCFOSp0v99yf533ffT9/PwoEeR84/M75nHvve/f93h+RkpJTwQ+Njxp/NNqo50G/Llo0LrB04GAvNAa5QTzQWNbo4IYyINkTQ76r0ercsPmzzhVyVWNKwgREe7ZdAb0Ny89ZfeaoXQG+2/IFqz2on7n6p/32a8xpjGg0abyvjDgGTOi1vGgD9yV/Io8Tzm/SuzdUP3T1hMsjvG7NFG0APrUoO9QXya2ZjyCfcfVbl4MPUuOtk6LaBrZYSvD4J8Adq5mnkvV4ePdc7XvNkv8H66LaBvhKAfhvlj+3mpmUvEd9WWNe4y75fwILXGEpwa+wlODjQV+73DMmweMN57lO9ScJD2/kkoS3WV3gQNdYSm0beOVyT9yAPzkGb7V1V3/RmLY8tWYhGJx6d8P7A0TgP1s+azXzSNLew31f39TodHVVMLGLpQT/m6UEP2r5DauZRUn7yFfJfk/uSX48/t2awMT4EfLA86KAHerb5H6ZT4Gv/iq5J5If/53qQjCxh6VyS/KLbibcoYUHY8bJRXg+6JO8j89Dknh1U+F5Z+68hK8n9yPwLyXcFgcaO9l2hW2NBpaGX3vf5f+F1C2WAg9fETjxJZaORjm6iEPUKykpKTlB/gL7w5ZZFHYL7wAAAABJRU5ErkJggg==>

[image43]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAYCAYAAACFms+HAAABoElEQVR4Xu2WzStEYRTGX58RxUJRUrOwUrYWlvZWyp6N2dhRUkrKhr/BiixsZKNkg8QKsVC+VuIPYGfDedzzzpz7zGnMWMwk91dPc87vfW/3zNw7dyaEjIz/x7SkkVy3pJcc6JfsSSZ4oR6cSz6dMHA3Wndo31Rcrj3HIT3weHr5m5lQ+mbWHFdTDlk4lLsKdeOAhQMGfGYZEo9P3tJi6t/cSlOSHpYe+/pqbxc+IdwFOQD/YuqYB8mSZFT7e8mk5FQyaPZZ0A9r3ad9WXYlr6bHJ4aDWo1Df2b6CA8QezyVIhvqto0DPBj369RXhDdQNYNblh0H2KHHleJHc1XwAKivTB+Bf6KeB1pwHICzt+SRupg7s+aCTZeO48HfTB+BX6Seh5xzHODBI2OS95Csr9BagYaQbOAnBg/AfYSdt2/ecQCuWeuBUHpPbwb/uALeItys6UfUWR4d5w2OK8IOwLVrndPesiq5JZeiKyQH5UPxJDupHQnXIVnrDP4XLg4dg6cSO/zYsUNykg+ttyQnWldEW0j+RP3EEIuMjIyMv8cXVu2W1vI0EoMAAAAASUVORK5CYII=>

[image44]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAYCAYAAACWTY9zAAABzUlEQVR4Xu2WPyhFcRTHD/IvsWDxZ6AoFoMFGwbJamEw2SwGg5JIBiUlpRiEySZlkZKREgpZLE+JWKQkyb9zuuf3nHt+517PZrif+vbO93tO9/d77/7euw8gISEj7lGXqC9UpepJqJ8R2agt1LhuKIYhmKvTDaQLwgtS/YQqFtkg53kii+QdleK6GqLfDeWNXK+zl5BfFf6BX1tRy6hRVC7qPD0Rwx34CxwZGfkzI9tXfkL4SVE79HUjoUE93G5k5EtVdsi5g+p54Y9FTVxAhreQsDZWw1kP+072miUI53Ton4WXvQLwP/FYrI11cDbHfo29Zgr8nHwVagXVrfI/YW3sgLMT9nvsNWMQ5IUqb1D+CoJD76iA4NsdSzn4i75xtsN+l73GbUwuqilCnQqfQs1ybV0zRC38fHIkd8b6uL/AXjMNdi7RfembUfXC/8oQhC/QpLxjA+zccY3KEX4A/Hm6Gyb94A9/Ghn5NpU9cm5RAsFZlSyCP0+/oyav4A9rT3ywJDQX9QizrtECfu7Om0c+BMMjqBmuy0ITP1BvG4LbQ4+x23A7zQ0qS4eM3NiLqCOhzcjzEAcd2ihoQ5s6FNCfBdocqVf1EhIS/hXf/12BbF+HzNQAAAAASUVORK5CYII=>

[image45]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAYCAYAAACvKj4oAAABzUlEQVR4Xu2WPSiGURTHj8/yMYiNEYuBQVFWZTUos81qoERKMhkMJgthYCWDIlkkKYnRRwYfqzL7Osdzjvc4z7mv10de6v7qn3t+9z73Psf7vA8AkUjkr7NkhWEAs4pptBOKOswapsdO5INyTB/mGvPMCUFzTTxe5NpC7oTHFVwXZaZ/n3pMN4+zNahvXLsdVfez00w5Lm981GCNcfvshdD1nssLoRvsBN/PQrrBK1UL5OmT1JSo8VceYbqndh536YlshBpcAN9PQLrBQ1UL5G/UWHKGGcN0cH2K6cXsYhrUOs005kDVT5yc8DYktsH3o5D4Mq5pvJeZfsPuK3WVcnPslpUj7Lm2Jr7d4Cb4XhqUx+2zDWrGHUdYJ9c2G58T3sHEDPh+EtI3fqRqgfyFqe1+w44jyOnvaC07nZwJXdACvl+BdIP3qhbIj5ja7jfoOMI2KNDf2A3w9wqSbTF5ehlo7tgLoeut89YNOY4gV2xqi+dcvIOFR46G1tJbUGhjpzl3nHcOfcLWEeTkJSZ1garFBSmEzIE2FnLrkDwyD5jb99OvHEOyrhL8F4c9o9RxW46Tfegn/aIvMfNcV/Pcj9FqhYP8zxqJRCKRf8ML48G5UTGg9ZwAAAAASUVORK5CYII=>