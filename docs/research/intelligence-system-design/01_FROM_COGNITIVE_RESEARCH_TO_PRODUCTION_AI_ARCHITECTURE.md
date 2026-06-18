# **Transforming Cognitive AI Research into Long-Term Operational Platforms: An Enterprise Architecture Blueprint**

## **Part 1 — The Research to System Gap**

### **Why AI Projects Fail Post-Research**

The transition of artificial intelligence from a successful research sandbox into a long-term operational platform represents a critical point where most enterprise initiatives collapse1. The structural causes of this breakdown are primarily organizational, process-driven, and architectural, rather than a reflection of weak core model capabilities1. In a research setting, models operate within stateless, isolated environments, evaluating highly curated, static datasets3. When these models are thrust into production, they are immediately exposed to real-world variables, including malformed inputs, multi-tenant state persistence, strict regulatory constraints, and adversarial execution vectors2.  
A common point of failure is the "dead data lake" syndrome5. Many organizations invest heavily in building centralized storage infrastructures, such as Snowflake, Databricks, or Amazon S3, and layering standard Business Intelligence (BI) dashboards on top5. While these dashboards present historically accurate structures, they are fundamentally static5. A profound gap persists between "insight" and "action"; business operators must manually extract numbers, run calculations in disconnected spreadsheets, and coordinate execution across fragmented communication channels5. When probabilistic models are placed directly on top of these flat warehouses via standard Retrieval-Augmented Generation (RAG), the system yields semantically plausible but structurally ungrounded outputs with high hallucination rates and an absolute lack of deterministic trust7.  
Furthermore, projects routinely fail due to a lack of a clear pathway from prototype to production2. Research initiatives driven primarily by technology excitement often bypass workflow integration, operational ownership, explicit decision rights, and automated, continuous evaluation frameworks1. When a probabilistic model's parameters are modified or context windows overflow under high-concurrency workloads, the system lacks the programmatic infrastructure to catch regressions or handle rate-limit failures gracefully3. The resulting technical debt, unchecked model drift, and integration complexity lead to rapid user rejection and ultimate project abandonment1.

### **Common Gaps Across the Lifecycle**

Translating advanced AI research into a stable, operational production platform exposes fundamental structural gaps across the lifecycle:

| Developmental Phase | Research Paradigm | Architectural Paradigm | Implementation Bottleneck | Deployment Challenge |
| :---- | :---- | :---- | :---- | :---- |
| **State & Memory** | Stateless, single-pass inference10. | Distributed, event-driven context graphs12. | Synchronizing vector, graph, and relational memory stores14. | Mitigating state drift and cache poisoning over long horizons4. |
| **System Behavior** | Probabilistic token generation with unconstrained context3. | Deterministic process flows with explicit safety guardrails15. | Developing low-latency evaluation pipelines and fallback mechanisms3. | Handling runtime context window overflow and API rate limits3. |
| **Operational Control** | Direct prompt-to-output interaction loops17. | Governed, dual-circle human-machine teaming18. | Coding domain constraints and Law of Armed Conflict (LOAC) boundaries20. | Establishing clear accountability and tamper-evident audit trails18. |
| **Compute Execution** | Heavy, monolithic framework dependencies (e.g., legacy codebases)23. | Modular, functional compilation optimized for target hardware24. | Refactoring object-oriented layers into pure functional transforms23. | Managing massive inference costs and ephemeral node lifecycles3. |

### **Bridging Strategies of Industry Leaders**

#### **OpenAI**

The transition from frontier research to production deployment is managed through the Preparedness Framework and the paradigm of "Safe Completions"26. Under this framework, when a model is classified as having "High capability" within a sensitive domain—such as Cybersecurity or Biological threats—the system automatically activates containment safeguards26. Rather than relying on simple, easily bypassed text-refusal prompts, OpenAI implements safe completions26. This approach ensures the model's outputs stay strictly within safety policies while remaining highly helpful, using reinforcement learning and post-training alignment to shape behavior26.  
This is supported by a real-time smart router that dynamically shifts queries between high-throughput speed models and deep reasoning models based on intent, complexity, and explicit context clues26. For high-risk defensive workflows, such as binary reverse engineering, OpenAI uses Trusted Access for Cyber (TAC), running models with lower refusal boundaries inside temporary, highly isolated container environments that prevent any cross-contamination or unauthorized data exfiltration28.

#### **Anthropic**

To bridge the research-to-system gap, Anthropic embeds its Constitutional AI (CAI) framework directly into its alignment pipelines17. This methodology replaces expensive and non-scalable human feedback with Reinforcement Learning from AI Feedback (RLAIF)30. By training the model to critique and revise its own outputs against a formalized natural language constitution, Anthropic generates highly transparent, predictable, and non-evasive models30.  
To bridge these models to enterprise applications, Anthropic introduced the Model Context Protocol (MCP), an open-source standard that decouples models from their tools and databases17. MCP provides a standardized runtime structure that enables models to securely read enterprise data and execute actions without requiring custom, hard-coded integrations for every tool17. This is supported by tools like Claude Code, which integrates these capabilities directly into developer terminals for production software development17.

#### **DeepMind**

DeepMind maintains a rigid engineering culture where research scientists are expected to write production-ready code and engineers actively parse academic literature to implement architectural revisions34. They bridged the legacy framework gap by standardizing their entire stack on JAX23. This shift allows researchers to utilize functional, stateless programming paradigms optimized for high-performance Tensor Processing Unit (TPU) compilation via Accelerated Linear Algebra (XLA)23.  
When migrating legacy TensorFlow models (which rely on object-oriented, stateful layer initialization), DeepMind utilizes multi-agent systems to automatically refactor the code into pure functional JAX/Flax architectures, validating functional parity through blind audit agents23. By building open-source declarative tools like Penzai and Treescope, DeepMind represents neural networks as transparent, easily editable PyTree data structures, allowing engineers to inspect, pretty-print, and inject runtime interventions into model activations on the fly during training and inference35.

#### **Palantir**

Palantir bridges the gap by treating data not as a static schema but as a live, bidirectional "Ontology" that serves as the authoritative digital twin of the enterprise5. The Ontology unifies semantic components (the "nouns": objects, links, properties) with kinetic components (the "verbs": actions, query functions, logic)6. AIP (AI Platform) embeds large models directly into this bidirectional knowledge graph, forcing the models to interact with the enterprise exclusively through a strictly governed semantic layer7.  
By utilizing "Scenario" primitives, AIP creates sandboxed branches of the ontology, enabling models to project the consequences of potential decisions in a safe universe before committing edits back to legacy transactional databases via audited Action blocks37. The entire pipeline is deployed on Apollo and Rubix, a hardened zero-trust Kubernetes runtime that enforces node ephemerality by draining and replacing compute nodes every 48 hours to mathematically constrain persistent cyber threats7.

#### **Microsoft AI**

Microsoft implements a unified multi-agent orchestration architecture by converging its research-driven AutoGen framework with its enterprise-ready Semantic Kernel SDK38. The platform employs an asynchronous, event-driven actor model (using the AutoGen Core runtime) where agents operate as decoupled software actors communicating via isolated mailboxes13.  
To enforce deterministic operational paths, Microsoft overlays the Semantic Kernel Process Framework38. This allows developers to map out complex, long-running business processes as stateful step-by-step state machines, ensuring that probabilistic multi-agent interactions are rigidly constrained within pre-defined workflow pipelines38.

## **Part 2 — Doctrine Design**

### **Defining the Operational AI Doctrine**

An AI Doctrine is a formalized, non-negotiable conceptual and operational manual that defines how an autonomous system must perceive its environment, process information, make decisions, execute actions, and evolve over time42. It serves as the system's foundational "DNA," translating high-level organizational ethics, legal mandates, and operational safety boundaries into a concrete computational architecture42. Before a single line of application code is written, a long-term operational AI platform requires a defined doctrine to prevent semantic drift, contain recursive logic loops, and guarantee that the system remains safe, predictable, and compliant with structural regulations1.

### **Doctrinal Foundations and Rules**

A comprehensive operational AI doctrine must explicitly define eight primary functional categories:

* **Goals**: Establishes the explicit, non-overlapping target states the system is authorized to achieve44. It enforces strict prioritization hierarchies (such as prioritizing safety over operational utility) to prevent goal-conflict situations45.  
* **Principles**: Sets the core constraints governing model execution, mandating that the platform must operate with calibrated uncertainty, prioritize factual accuracy over compliance metrics, and explicitly identify its own knowledge limitations17.  
* **Boundaries & Safety Gates**: Establishes compute and action-oriented containment protocols31. It maps system operations to a defined scaling framework, enforcing automatic "circuit breakers" that halt execution if confidence thresholds drop or if the transaction encounters a high-risk operational domain26.  
* **Memory Rules**: Enforces distinct retention boundaries across temporal states12. It dictates what information must be archived as permanent, validated truth and what must decay exponentially over time to prevent cognitive overload and cache poisoning4.  
* **Reasoning/Processing Rules**: Governs how the cognitive engine processes ambiguous inputs49. It mandates the use of Structured Analytic Techniques (SATs), such as the Analysis of Competing Hypotheses (ACH), forcing the system to prioritize disconfirming evidence over confirmatory patterns50.  
* **Governance & Decision Rights**: Establishes clear accountability boundaries18. It dictates when the system is authorized to act autonomously and when it must pause and generate a formal operational pull request (or proposal) for human approval5.  
* **Confidence & Validation Rules**: Dictates how source material is graded53. It requires that all ingested data be assigned a multi-axis evaluation metric, separating source reliability from information credibility to prevent the propagation of deceptive or corrupted data51.  
* **Learning & Evolution Rules**: Controls how the system self-improves32. It establishes that runtime failures and operational logs must undergo an offline, sandboxed self-critique and distillation process before any updates are compiled into the core knowledge base11.

### **Lessons from High-Reliability Sectors**

#### **Military Organizations**

Modern defense forces deploy AI under strict doctrinal models such as the Law of Armed Conflict (LOAC) and mission-specific Rules of Engagement (ROE)20. These systems are built around the concept of "meaningful human control"22. The doctrine dictates that an automated weapon system or cyber agent may only execute lethal actions if they are both permissible under international law and explicitly obligatory under immediate mission parameters21.  
The system must maintain a constant, real-time feedback loop where the command hierarchy retains overriding authority, and any bypass of ethical subroutines requires explicit, logged human acceptance of legal liability21. This is codified in frameworks like the Unified Defense AI Integration Model (UDAIM), which interlocks generative systems with cyber resilience and strategic command doctrine42. Operational command posts utilize Area Air Defense Commander (AADC) roles and C4I systems to orchestrate active and passive defense layers56.

#### **Intelligence Agencies**

Intelligence tradecraft uses Structured Analytic Techniques (SATs) to eliminate cognitive bias and structural errors49. Platforms mapping to this domain translate these tradecraft standards into systemic algorithms54. The core doctrine employs the Admiralty Code (a two-axis matrix grading source reliability from A–F and information credibility from 1–6) to prevent the laundering of weak or deceptive reports into high-confidence strategic plans51.  
Under Heuer's disconfirmation principle, intelligence systems construct an Analysis of Competing Hypotheses (ACH) matrix50. The system is doctrinally forbidden from selecting the "most comfortable" or intuitive answer; instead, it must run iterative, directed collection queries to identify evidence that systematically refutes competing theories, evaluating final options based on their relative lack of disconfirming proof50. This is supported by deception detection checklists (such as MOM, POP, MOSES, and EVE) to uncover adversarial manipulation of incoming intelligence53.

#### **Aviation Systems**

Aviation safety relies on the strict standardization of Crew Resource Management (CRM) and Safety Management Systems (SMS)60. When translating CRM into automated flight decks and AI platforms, the core operational doctrine is split into two distinct execution structures: Do-Verify (DV) and Challenge-Do-Verify (CDV)62.

* **Do-Verify (DV)**: The automation executes a rapid, pre-programmed sequence of operational tasks to stabilize the aircraft or system state, and then requires the crew or verification system to check that all critical parameters align with safe operation62.  
* **Challenge-Do-Verify (CDV)**: For non-normal or high-risk scenarios, the automation is structurally blocked from proceeding to the next step without an explicit "challenge" query, a manual or separate execution "do," and a multi-system, independent "verify" phase62.

This checklist philosophy ensures that during periods of extreme high latency or operational stress, human short-term memory constraints do not lead to system failures or unmonitored anomalies62.

## **Part 3 — From Doctrine to Data Models**

### **Structural Translation of AI Doctrine**

To convert natural language AI doctrine into a deterministic, production-grade database schema, the system architect must translate conceptual rules into structured, typed, and schema-enforced relational, graph, and vector primitives14. The primary computational mechanism for this is a governed, typed, live, bidirectional digital twin5.

### **Technical Blueprint: Entities, Relationships, and Primitives**

#### **1\. Entities & Nouns (The Domain Elements)**

Every real-world asset, concept, or event is represented as a strongly typed object class within an Ontology Metadata Service (OMS)6.

* **Platform Entities**: (e.g., Asset, User, Location, SOP\_Checklist, Agent).  
* **Cognitive Entities**: (e.g., Hypothesis, Claim, Evidence, Observation, Action\_Trace, Assumption, Contradiction).

#### **2\. Relationships & Links (The Edge Primitives)**

Edges represent typed, bidirectional, and structurally constrained links6.

* **Structural Links**: (e.g., Asset ![][image1] LOCATED\_IN ![][image1] Location).  
* **Cognitive Links**: (e.g., Observation ![][image1] SUPPORTS or CONTRADICTS ![][image1] Hypothesis; Claim ![][image1] SOURCED\_FROM ![][image1] Evidence).

Link constraints enforce relational integrity: an action cannot be linked to an entity class that does not support that action's specific "verb"36.

#### **3\. Knowledge Graph Integration**

To bridge the gap between unstructured research data and deterministic action, the system constructs a multi-layered semantic hierarchy7. Unstructured documents undergo coreference resolution and entity extraction50. The resulting facts are committed to the graph as explicit nodes and edges while retaining direct trace links to their raw text chunk sources to preserve absolute data provenance47.

#### **4\. Memory Structures**

The memory layer is split into three functionally decoupled but interconnected graph layers12:

* **Episodic Memory**: Stores short-term session states, conversational history, and immediate operator interactions12.  
* **Semantic Memory**: Acts as the slow-moving, long-term foundation of enterprise facts, immutable metadata, and organizational structures12.  
* **Reasoning & Execution Memory**: Captures the step-by-step decision traces, tool execution logs, and evaluation metrics generated during a specific system run12.

#### **5\. Event Structures**

Every system change or operator interaction is treated as an immutable transaction event6. These events are dispatched asynchronously across a distributed message bus13.

* **Schema**: Each event contains a unique identifier, an active trace ID, the actor ID (system agent or human operator), the target node ID, the specific action executed, and the precise timestamp37.

#### **6\. Confidence Structures**

Every propositional unit (node or edge) is indexed with a dynamic confidence payload48.

* **Schema**:  
  ![][image2]  
  where Source Reliability maps to the Admiralty scale51.

#### **7\. Contradiction & Conflict Structures**

When two distinct claims or observations contain overlapping spatial-temporal coordinates but incompatible property values, the system instantiates a Contradiction object59. This object maps bidirectional conflict links between the offending claims and triggers a disconfirmation audit pipeline, preventing downstream reasoning engines from executing decisions on a poisoned or unstable data partition50. The conflict is represented as a "lie web" visualization, utilizing a "red yarn" link model to visually flag and block compromised execution paths across the ontology65.

### **Schema Configuration: Relational and Graph DDL**

SQL  
\-- PostgreSQL / PGVector Schema for Cognitive Entities and Contradictions  
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  
CREATE EXTENSION IF NOT EXISTS "vector";

\-- 1\. Source Document / Evidence Table  
CREATE TABLE source\_evidence (  
    evidence\_id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    source\_title VARCHAR(255) NOT NULL,  
    source\_type VARCHAR(50) NOT NULL, \-- e.g., 'system\_log', 'intel\_report', 'sensor'  
    source\_reliability CHAR(1) CHECK (source\_reliability IN ('A', 'B', 'C', 'D', 'E', 'F')), \-- Admiralty Source  
    information\_credibility CHAR(1) CHECK (information\_credibility IN ('1', '2', '3', '4', '5', '6')), \-- Admiralty Credibility  
    ingestion\_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP NOT NULL  
);

\-- 2\. Claim Node Table (Integrates Vector and Relational Models)  
CREATE TABLE claim\_nodes (  
    claim\_id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    evidence\_id UUID REFERENCES source\_evidence(evidence\_id) ON DELETE CASCADE,  
    extracted\_text TEXT NOT NULL,  
    entity\_subject VARCHAR(100) NOT NULL,  
    relationship\_predicate VARCHAR(100) NOT NULL,  
    entity\_object VARCHAR(100) NOT NULL,  
    confidence\_score FLOAT CHECK (confidence\_score \>= 0.0 AND confidence\_score \<= 1.0) NOT NULL,  
    temporal\_anchor TIMESTAMP WITH TIME ZONE NOT NULL,  
    embedding\_vector VECTOR(768) NOT NULL, \-- Core text embedding  
    CONSTRAINT unique\_claim\_triple UNIQUE (entity\_subject, relationship\_predicate, entity\_object, temporal\_anchor)  
);

\-- 3\. Contradiction Tracker Table  
CREATE TABLE contradictions (  
    contradiction\_id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    claim\_a\_id UUID REFERENCES claim\_nodes(claim\_id) ON DELETE CASCADE,  
    claim\_b\_id UUID REFERENCES claim\_nodes(claim\_id) ON DELETE CASCADE,  
    conflict\_type VARCHAR(100) NOT NULL, \-- e.g., 'spatial\_overlap', 'property\_clash'  
    severity\_score FLOAT CHECK (severity\_score \>= 0.0 AND severity\_score \<= 1.0) NOT NULL,  
    resolution\_status VARCHAR(50) DEFAULT 'unresolved' CHECK (resolution\_status IN ('unresolved', 'resolved', 'suppressed')),  
    detection\_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP NOT NULL,  
    CONSTRAINT check\_distinct\_claims CHECK (claim\_a\_id \< claim\_b\_id)  
);

Cypher  
// Neo4j Cypher Schema for Cognitive Context Graph and Heuer ACH Matrix  
// 1\. Create constraints to ensure entity identity and uniqueness  
CREATE CONSTRAINT UNIQUE\_OBJECT\_URI ON (o:Object) ASSERT o.uri IS UNIQUE;  
CREATE CONSTRAINT UNIQUE\_CLAIM\_ID ON (c:Claim) ASSERT c.id IS UNIQUE;  
CREATE CONSTRAINT UNIQUE\_HYPOTHESIS\_ID ON (h:Hypothesis) ASSERT h.id IS UNIQUE;

// 2\. Insert Object Digital Twins and directional relations  
MERGE (o1:Object {uri: "fleet\_asset\_alpha", type: "Vessel"})  
SET o1.status \= "Active", o1.last\_updated \= datetime()  
MERGE (o2:Object {uri: "geoint\_zone\_primary", type: "GeospatialZone"})  
MERGE (o1)-\[:LOCATED\_IN {since: datetime()}\]-\>(o2);

// 3\. Link Evidence to claims and hypotheses  
MERGE (c1:Claim {id: "claim\_001"})  
SET c1.text \= "Asset Alpha is offline", c1.confidence \= 0.85  
MERGE (ev:Evidence {id: "sensor\_feed\_99"})  
SET ev.reliability \= "A", ev.credibility \= "1"  
MERGE (ev)-\[:SUBSTANTIATES {extracted\_at: datetime()}\]-\>(c1);

// 4\. Map the Heuer disconfirmation links (ACH Matrix in graph form)  
MERGE (h1:Hypothesis {id: "hyp\_insider\_sabotage"})  
SET h1.text \= "Internal deliberate sabotage of network connection"  
MERGE (h2:Hypothesis {id: "hyp\_hardware\_fault"})  
SET h2.text \= "Hardware NIC failure due to thermal degradation"

// Link disconfirming / contradicting relationships (Core ACH principle)  
MERGE (c1)-\[r1:CONTRADICTS {diagnosticity: 0.90}\]-\>(h2)  
MERGE (c1)-\[r2:SUPPORTS {diagnosticity: 0.30}\]-\>(h1);

## **Part 4 — From Data Models to Memory Systems**

### **Memory Consolidation Systems Architecture**

A long-term operational AI platform must reject simple database mono-cultures14. To build a scalable, highly secure, and stateful memory core, the system architecture must unify three distinct storage layers into a federated memory engine14:

* **Relational Engine (PostgreSQL / SQLite)**: Serves as the absolute system of record14. It stores raw transaction schemas, structured user profiles, raw parsed document chunks, exact execution provenance traces, and operational system configurations14.  
* **Vector Engine (LanceDB / Qdrant)**: Stores high-dimensional embedding vectors generated from chunked unstructured text and extracted entity properties, facilitating rapid semantic similarity search3.  
* **Graph Engine (Memgraph / Neo4j)**: Stores structured entity properties, directed relational edges, active conversation states, and Heuer disconfirmation matrix links10. This engine executes complex multi-hop path traversals and community detection algorithms in sub-millisecond cycles10.

Every discrete node committed to the graph maintains an identical unique identifier within the vector database and the relational database, ensuring that any vector search return functions as a direct lookup hint to load structural graph triplets and complete provenance records55.

### **Cognitive Memory Rules**

#### **Retaining**

The system retains observations and claims if they are verified by a high-reliability source (Admiralty grade A–C) or if they directly resolve an active Key Intelligence Question (KIQ) mapped to the platform's active objective50. Every ingestion event creates an initial node activation score calculated as:  
![][image3]  
\[cite: 53, 66\]

#### **Updating**

When fresh evidence is ingested, the system executes entity resolution7. If properties clash, instead of overwriting the historical value, a new temporal version of the property is appended to the graph node, and an edge weight validation algorithm updates the confidence value of the overall path based on Bayesian probability updates48.

#### **Forgetting (Epistemic Decay)**

The system prevents context window overflow and technical debt through an active, automated decay protocol modeled on the Beta distribution and exponential half-life formulas3.  
The temporal decay of information reliability over time is governed by:  
![][image4]  
48  
Where ![][image5] is the initial reliability score at observation time ![][image6], and ![][image7] represents the domain-specific decay constant48. Normalizing information staleness over its maximum useful lifetime ![][image8]:  
![][image9]  
48  
As information ages without fresh corroborating observations, uncertainty propagates through the parameters of the Beta distribution (![][image10]) modeling threat and system beliefs:  
![][image11]  
48  
![][image12]  
48  
The unified confidence adjustment factor ![][image13] is updated dynamically:  
![][image14]  
48  
Where ![][image15] is the uncertainty propagation rate48. A background cron job periodically scans the graph, pruning nodes and links whose confidence value falls below a configurable threshold (e.g., ![][image16]), archiving them to cold relational storage to preserve system efficiency55.

#### **Retrieving (Retrieval Trace Optimization)**

To avoid standard semantic chunking retrieval failures, the system implements Retrieval Trace Optimization (RTO)55. When a query is initiated, the platform maps the query statement to its vector database to extract semantic candidate nodes55.  
These nodes serve as entry anchors to the graph database55. The system dynamically evaluates task-dependent traversal policies using reinforcement learning models optimized for trace selection55:

* **Constraint-Satisfaction Mode**: For logistical or system feasibility checks, the traversal prioritizes constraint nodes, checking edges for blocking security marks or property limits early in the path resolution sequence55.  
* **Root-Cause Explanatory Mode**: For fault diagnosis or complex intelligence queries, the traversal executes broad multi-branch walks and community aggregation, collecting surrounding context from parent and child clusters to present a complete evidence model50.

The traversed path is captured as a deterministic, inspectable execution trace, ensuring that the final answer is explained by explicit structural edges rather than unpredictable token probabilities10.

## **Part 5 — Implementation Roadmaps**

### **Tactical System Initialization Sequencing**

To convert cognitive research streams into a robust enterprise system, organizations must avoid starting with complex multi-agent orchestration or premature custom model fine-tuning69. Instead, they must follow a logical, dependency-driven tactical timeline1.

\+----------------------------------------------------------------------------------------------------+  
|                                    TACTICAL LIFECYCLE ROADMAP                                      |  
\+----------------------------------------------------------------------------------------------------+  
|  \[M1 \- M3\] PHASE 1: SEMANTIC BASELINE                                                              |  
|    \- Initialize PostgreSQL schema, Memgraph database connections, and LanceDB configurations.      |  
|    \- Commit domain entities (Venue, Trainee, Skill) into OMS structure.                            |  
|    \- Gate: 100% data compliance checks pass on database connections.                               |  
\+----------------------------------------------------------------------------------------------------+  
|  \[M4 \- M6\] PHASE 2: KINETICS & PERMISSIONS LAYER                                                   |  
|    \- Configure Model Context Protocol (MCP) server endpoints.                                      |  
|    \- Code Action schemas and authorization profiles.                                               |  
|    \- Gate: Demonstrate safe transactional isolate execution of tool calls inside sandboxes.        |  
\+----------------------------------------------------------------------------------------------------+  
|  \[M7 \- M9\] PHASE 3: COGNITIVE DECISION LOOP                                                        |  
|    \- Deploy Observe-Orient workers and integrate Heuer ACH matrix query engine.                    |  
|    \- Implement OODA loop pattern across multi-agent nodes.                                         |  
|    \- Gate: Auto-detection of spatial anomalies and correct logical disconfirmation scoring.         |  
\+----------------------------------------------------------------------------------------------------+  
|  \[M10 \- M12\] PHASE 4: SCALING & DISTILLATION                                                       |  
|    \- Implement Constitutional AI / RLAIF post-training pipelines and belief decay cron jobs.       |  
|    \- Integrate AIP Evals suites.                                                                   |  
|    \- Gate: System automatically prunes stale memory and blocks unauthorized compute scaling.       |  
\+----------------------------------------------------------------------------------------------------+

### **Mitigating Overengineering**

To build a sustainable operational platform, architects must enforce strict engineering constraints:

* **Decline Custom Pre-Training Early**: Do not attempt to pre-train or fine-tune custom domain foundation models in the initial development phases9. Modern proprietary or open-weight frontier models (such as Claude Sonnet or open equivalents) possess massive reasoning and tool-calling capabilities that cannot be matched by enterprise budgets71. The objective is to build a persistent, governed world model (the Ontology) and route queries to optimized models dynamically7.  
* **Contain the Context Window**: Do not dump raw, uncurated enterprise documents into large context windows3. While modern models support massive context windows, this pattern generates exponential API bills, increases latency to unacceptable thresholds, and dilutes the model's focus, causing retrieval degradation3. State must be managed systematically via context graphs and RTO12.  
* **Enforce Kinetic Boundaries**: Avoid permitting models to write code that executes directly on production environments without independent, sandbox-isolated container testing and human-in-the-loop validation4. Probabilistic output must never translate to direct, unmonitored production side-effects37.

## **Part 6 — Case Study**

### **Context and Operational Setting**

This case study details the construction of a production-grade enterprise intelligence platform for a high-risk security training facility (the "Academy"). The platform must integrate three discrete, historically isolated research streams:

* **Venue Intelligence Research**: Advanced sensor processing, real-time spatial logistics, and physical asset constraint mapping.  
* **Academy Intelligence Research**: Instructional design frameworks, multi-tenant learning trajectories, and historical skill degradation profiles.  
* **Cognitive Architecture Research**: Multi-agent state machine coordination, Structured Analytic Techniques (SATs), and human state estimation systems.

The objective is to deploy a unified, persistent platform that observes training venues, updates individual learning graphs, identifies real-time safety anomalies, and schedules targeted intervention scenarios while maintaining strict compliance with operational safety standards.

### **System Architecture Schema**

\+----------------------------------------------------------------------------------------------------+  
|                                    ACADEMY INTELLIGENCE SYSTEM                                     |  
\+----------------------------------------------------------------------------------------------------+  
|                                     COGNITIVE REASONING LAYER                                      |  
|    \- OODA Loop Workers        \- Heuer ACH Engines        \- Human State Estimators                  |  
\+----------------------------------------------------------------------------------------------------+  
|                                     ONTOLOGY / SEMANTIC CORE                                       |  
|    \- Venue Objects (Sensors)  \- Academy Objects (Skills) \- Dynamic Kinetic Actions                 |  
\+----------------------------------------------------------------------------------------------------+  
|                                      FEDERATED MEMORY ENGINE                                       |  
|    \- LanceDB Vector Store     \- Memgraph Graph DB        \- PostgreSQL Relational Core              |  
\+----------------------------------------------------------------------------------------------------+

### **Case Study Implementation Breakdown**

#### **Phase 1: Interlocking Ontology Synthesis (Weeks 1–8)**

The initial phase focuses on mapping the three distinct research silos into a unified enterprise ontology within the Ontology Metadata Service (OMS)6.

* **Venue Domain**: Define object types for Venue (physical layout, environmental limits), Sensor (cameras, wearables, spatial radar), and Asset (instructional equipment, safety gear) linked by strict geometric constraints36.  
* **Academy Domain**: Define object types for Trainee (demographics, access permissions), Skill\_Node (learning matrices, physical skill targets), and Instructional\_Event (scenarios, tests)36.  
* **Cognitive Domain**: Instantiate the logic schemas for Observation\_Event, Anomaly\_Claim, and Safety\_Hypothesis36.

These domains are interlocked via semantic edges: a Trainee is ASSIGNED\_TO an Instructional\_Event, which is CONDUCTED\_IN a Venue, which is MONITORED\_BY a Sensor6.

#### **Phase 2: Deployment of the Persistent Federated Memory Core (Weeks 9–16)**

Physicalize the multi-tier memory structure14. Deploy an ACID-compliant PostgreSQL database to act as the relational root of record, storing physical venue telemetry logs, exact course enrollment schedules, and historical evaluation credentials10. Standardize a Memgraph instance as the live context graph, maintaining active spatial-temporal links, human-skill associations, and anomalous observation vectors10. Maintain a LanceDB instance, storing text embedding vectors of trainee historical performance reviews and instructional manuals55. Enforce strict referential constraints: any Sensor alert emitted from the physical venue updates the spatial coordinates of the corresponding object twin in PostgreSQL, inserts a directional link in Memgraph, and triggers a localized vector look-up in LanceDB to load similar context incidents7.

#### **Phase 3: Cognitive Agent Execution Coordination (Weeks 17–24)**

With state and structure validated, we deploy the cognitive agent loop using the OODA (Observe-Orient-Decide-Act) orchestration model4:

* **Observe**: Ephemeral background workers ingest continuous venue sensor feeds and trainee biometrics, writing raw events directly to PostgreSQL and generating structured claim triples64.  
* **Orient**: A processing agent queries the Memgraph context graph, evaluating trainee spatial proximity to physical hazard nodes and identifying properties that clash with historical proficiency profiles55.  
* **Decide**: When a significant mismatch or safety hazard is identified, the system instantiates a Heuer ACH matrix50. It constructs competing hypotheses (e.g., ![][image17]: Trainee is experiencing heat exhaustion; ![][image18]: Trainee is executing a planned operational maneuver; ![][image19]: Wearable biometric sensor is malfunctioning)52. The agent executes dynamic queries to check against disconfirming evidence (such as ![][image20]: Sensor battery level is ![][image21]; ![][image22]: Environmental wet-bulb temperature is ![][image23])51.  
* **Act**: If the disconfirmation matrix eliminates sensor failure and normal performance, the system constructs a Proposal to alter the venue environmental controls5. If high-risk thresholds are crossed, an automated alert is dispatched directly to the instructional command desk via an audited Action block6.

#### **Phase 4: Operational Verification & CRM-Driven Safety Gates (Weeks 25–32)**

Enforce continuous validation and safety gates:

* **System Evaluation**: Deploy AIP Evals suites, establishing automated tests that run simulated anomalous runs through the ACH matrix to ensure that disconfirmation metrics operate with over ![][image24] correctness prior to operational use7.  
* **Human-in-the-Loop Integration**: Embed the Challenge-Do-Verify checklist protocol into the operator interfaces62. The platform cannot alter physical venue attributes or deploy safety blockades without sending an explicit "Challenge" alert, requiring manual instructor confirmation ("Do"), and executing a multi-sensor diagnostic run ("Verify")62.  
* **Audit Trails**: Write all execution traces, traversed graph paths, and decision metrics to a write-once, read-many PostgreSQL partition, generating unique cryptographic hashes for every transaction to guarantee absolute forensic audibility10.

## **Part 7 — Output Frameworks**

### **Output 1 — Research-to-Doctrine Framework**

This framework establishes the operational rules and architectural translations required to convert cognitive research streams into a robust enterprise system:

| Research Domain | Abstract Research Insight | Doctrinal Rule | Architectural Implementation | Reference |
| :---- | :---- | :---- | :---- | :---- |
| **Conversational Intelligence** | Multi-turn dialog systems optimize task execution but are vulnerable to context drift16. | Conversations must be bounded by active session states and must never cross tenant boundaries55. | Separate conversational history into short-term episodic memory stores with automated context summarization12. | \[cite: 12, 47, 55\] |
| **Long-Term Memory** | Vector search scales semantic retrieval but fails to capture structural dependencies10. | Enterprise facts must be represented as immutable, curated triplets linked to source credentials12. | Construct a multi-tier memory core unifying vector search anchors with explicit graph DB edges14. | \[cite: 12, 14, 55\] |
| **Knowledge Evolution** | Dynamic environments require constant updates, causing database corruption1. | Data updates must not overwrite historical states; updates must use temporal properties and decay paths48. | Implement Bayesian belief propagation and exponential confidence decay on the graph nodes48. | \[cite: 48, 64, 68\] |
| **Human State Modeling** | Wearable biometric inputs contain noise and are prone to sensor failures3. | Human states must be treated as probabilistic hypotheses, never as single deterministic properties52. | Run biometric anomalies through a Heuer ACH disconfirmation matrix before initiating intervention tasks50. | \[cite: 50, 51, 52\] |
| **Context-Aware Reasoning** | Stateless models lack situational awareness and generate hallucinations7. | Models must interact with data exclusively through a strongly typed, governed semantic layer7. | Force all model interactions to query objects via the Object Set Service (OSS), prohibiting raw warehouse SQL6. | \[cite: 6, 7\] |
| **Governance & Decision Rights** | Probabilistic models executing direct writes cause catastrophic state drift1. | Agents are strictly forbidden from writing to production; they can only generate signed proposals5. | Map kinetic actions to strict schema definitions requiring dual-circle human signature approvals6. | \[cite: 5, 6, 37\] |

### **Output 2 — Doctrine-to-Architecture Framework**

This framework details the concrete architectural patterns and system components that enforce doctrinal boundaries:

| Doctrinal Domain | Doctrinal Rule | Architectural Pattern | Core Enforcing Component | Reference |
| :---- | :---- | :---- | :---- | :---- |
| **Goals** | Safety constraints must override short-term operational targets45. | Responsible Scaling Policy (RSP) Control Loop31. | Automated compute execution throttles and state checkpoint rollbacks31. | \[cite: 31, 45\] |
| **Principles** | Models must execute with calibrated uncertainty and acknowledge limits17. | Model-Agnostic Routing & Fallbacks7. | k-LLM Router shifting queries between speed and thinking modes7. | \[cite: 7, 26, 46\] |
| **Boundaries** | Compute and action scaling must be bounded by risk tiers31. | Ephemeral Sandbox Containers28. | Zero-trust isolated execution nodes rotating on 48h lifecycles7. | \[cite: 7, 28, 75\] |
| **Memory** | Memory states must prevent context dilution and cache poisoning3. | Multi-Tier Storage Engine14. | Federated database layer (PostgreSQL, LanceDB, and Memgraph)14. | \[cite: 4, 14, 55\] |
| **Reasoning** | The system must prioritize disconfirming evidence to resolve claims50. | Structured Analytic Techniques (SATs)49. | Automated Heuer Analysis of Competing Hypotheses (ACH) Engine50. | \[cite: 50, 51, 59\] |
| **Governance** | Probabilistic agents are blocked from executing unapproved side-effects37. | Bidirectional Branching Ontology5. | Ontology Proposals requiring cryptographic dual-circle operator signatures6. | \[cite: 5, 6, 37\] |
| **Confidence** | Source reliability must be evaluated separately from claim plausibility51. | Two-Axis Evaluation Matrix53. | NATO Admiralty Code parsing engine mapping to entity metadata fields51. | \[cite: 51, 53, 54\] |
| **Learning** | Feedback updates must not corrupt the production environment1. | Offline Self-Critique and Distillation30. | Constitutional AI reinforcement loop running on isolated staging branches32. | \[cite: 1, 30, 31\] |

### **Output 3 — Architecture-to-Data Framework**

This framework specifies the structural mappings and relationship constraints required to model the cognitive twins:

| Architectural Component | Object Classes (Nouns) | Operational Links (Edges) | Cardinality Constraints | Data Integrity Rules | Reference |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Physical Assets** | Venue, Sensor, Asset | LOCATED\_IN, MONITORS | ![][image25] (A Venue has many Sensors)36 | Sensor telemetry coordinates must resolve strictly inside Venue spatial bounds36. | \[cite: 6, 36\] |
| **Academy Matrix** | Trainee, Skill\_Node, Course | ENROLLED\_IN, ACQUIRES | ![][image26] (A Trainee acquires many Skills)36 | Skill\_Node updates require verified completion properties from Course records36. | \[cite: 36, 37\] |
| **Cognitive Loop** | Observation, Claim, Hypothesis | SUPPORTS, CONTRADICTS | ![][image27] (A Claim supports many Hypotheses)50 | Confidence scores of claims must decay exponentially over elapsed temporal horizons48. | \[cite: 48, 50, 68\] |
| **Kinetics Plane** | Action, Proposal, Operator | INITIATES, AUTHORIZES | ![][image28] (A Proposal triggers one Action)6 | No write action can occur without an authorized signature associated with a validated user ID6. | \[cite: 6, 37\] |

### **Output 4 — Data-to-Memory Framework**

This framework defines the physical storage orchestration layers and dynamic consolidation rules:

| Memory Tier | Database Engine | Primary Data Types | Memory Logic & Temporal Rules | Consolidation Process | Reference |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Episodic (Short-Term)** | Memgraph DB10 | Active graph paths, biometric signals, session states12. | Ephemeral; state decays dynamically using Beta distributions4. | Raw claims are grouped into potential event patterns via real-time traversals10. | \[cite: 12, 48, 55\] |
| **Semantic (Long-Term)** | PostgreSQL14 | Curated digital twins, transactional records, system schemas14. | Permanent; strict referential integrity and version control14. | Validated claims (A1-grade) are written back as immutable facts in SQL6. | \[cite: 6, 14, 55\] |
| **Grounding Vector** | LanceDB55 | High-dimensional embedding vectors (768d)55. | Mapped to active semantic and episodic graph node URIs55. | Ingestion pipeline embeds raw documents, updating nearest neighbor tables55. | \[cite: 3, 55\] |

### **Output 5 — Production Intelligence Framework**

This framework structures the real-time operational cycle of the platform:

| Phase | System Actor | Input Primitive | Cognitive Processing | Output Primitive | Reference |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Observe** | Ephemeral Sensor Worker | Streaming raw UDP / API feeds from physical devices. | Raw observations are normalized, timestamped, and mapped to the OMS schema6. | Strongly typed Observation\_Result committed to relational store66. | \[cite: 6, 66, 68\] |
| **Orient** | Context Processing Agent | Live context graph paths and semantic candidate objects12. | Maps spatial-temporal overlaps, detects property clashes, and instantiates contradiction records59. | Evaluated Claim node and bidirectional conflict link updates in graph DB55. | \[cite: 12, 55, 59\] |
| **Decide** | Heuer Analytic Reasoner | Claims, evidence diagnostic values, and objective structures50. | Runs iterative disconfirmation matrix, scores competing options, and rejects biased paths50. | Schema-validated Ontology\_Proposal with full logical trace5. | \[cite: 5, 50, 51\] |
| **Act** | Kinetic Execution Engine | Approved ontology proposal and operator signatures6. | Validates target constraints, checks branch safety parameters, and commits transactional changes6. | Ephemeral write back to enterprise source database or local API trigger37. | \[cite: 6, 37\] |

### **Output 6 — AI System Implementation Roadmap**

This roadmap structures the tactical timeline and deployment milestones over a 12-month lifecycle:

| Phase | Milestone Name | Target Duration | Core Objectives | Exit Criteria / Validation Gate | Reference |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Phase 1** | Semantic Baseline | Months 1–3 | Deploy federated memory stores (PostgreSQL, LanceDB, Memgraph)14; define domain ontology schemas inside OMS6. | 100% data ingestion pipelines pass referential integrity and type validation checks36. | \[cite: 6, 14, 36\] |
| **Phase 2** | Kinetic Core | Months 4–6 | Code action schemas6; configure MCP tool endpoints17; implement sandboxed Branching Scenarios37. | Demonstrate that a simulated agent cannot modify any database properties without an operator signature5. | \[cite: 17, 37\] |
| **Phase 3** | Cognitive Orchestration | Months 7–9 | Deploy Observe-Orient workers68; integrate Heuer ACH disconfirmation engines and contradiction loops50. | Automated detection of cross-document contradictions with correct disconfirmation scoring50. | \[cite: 50, 51, 68\] |
| **Phase 4** | Safe-Scaling | Months 10–12 | Deploy Constitutional AI / RLAIF post-training pipelines30; configure belief decay crons and RSP gates31. | Demonstrate automated compute throttling when agent confidence scores fall below safety levels31. | \[cite: 30, 31\] |

### **Output 7 — Organizational Learning Roadmap**

This framework details the change management, upskilling, and platform evolutionary milestones required to sustain the operational system:

| Target Audience | Phase 1 (M1-M3) | Phase 2 (M4-M6) | Phase 3 (M7-M9) | Phase 4 (M10-M12) | Reference |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Developer Teams** | Transition from object-oriented scripting to functional compilation and declarative PyTree paradigms23. | Master MCP tool schema construction, validation routines, and sandboxed execution17. | Build and configure automated multi-agent routing, state machine transitions, and fallback paths38. | Implement offline Constitutional AI alignment critique loops and RLAIF preference updates30. | \[cite: 17, 23, 30, 40\] |
| **Operations (MLOps)** | Deploy, scale, and monitor distributed multi-store engine synchronization (SQL \+ Vector \+ Graph)14. | Establish robust API rate limiting, cache optimization, and contextual prefix-caching3. | Monitor context graphs, track active query latency, and optimize traversal trace paths55. | Enforce hardware-level RSP boundaries, automated compute circuit breakers, and container rotation7. | \[cite: 7, 14, 31, 55\] |
| **Analysts & Operators** | Complete basic AI literacy curricula; understand standard ontology schemas and entities9. | Learn and execute the proposal branching and approval workflows inside the interactive dashboard5. | Master structured analytic techniques, Heuer ACH matrix variables, and source reliability scoring51. | Enforce Crew Resource Management guidelines, DV checklists, and safety escalation procedures60. | \[cite: 5, 9, 51, 62\] |

### **Output 8 — Enterprise Intelligence Platform Blueprint**

The logical and physical blueprint of the operational AI platform is structured across six distinct, decoupled, and secure layers:

\+----------------------------------------------------------------------------------------------------+  
|                                  ENTERPRISE PLATFORM BLUEPRINT                                     |  
\+----------------------------------------------------------------------------------------------------+  
|  1\. COMPUTE & RUNTIME LAYER                                                                        |  
|    \- Zero-Trust Kubernetes Runtime (Drained/re-built on 48h ephemeral lifecycle schedules) |  
|    \- GPU/TPU compilation environments (JAX, XLA optimized execution stacks)         |  
\+----------------------------------------------------------------------------------------------------+  
|  2\. DATA INGESTION & COGNITION LAYER                                                               |  
|    \- Object Data Funnel (Asynchronous stream processor, entity alignment tools) \[cite: 6, 64\]      |  
|    \- Document Processing Pipeline (Raw parser, metadata coreference processors)     |  
\+----------------------------------------------------------------------------------------------------+  
|  3\. PERSISTENT MEMORY ENGINE (FEDERATED CORE)                                                      |  
|    \- PostgreSQL (ACID-compliant relational transactional records)                   |  
|    \- LanceDB (768d vector similarity retrieval space)                                   |  
|    \- Memgraph (Low-latency structural context and action-decision graph pathing)     |  
\+----------------------------------------------------------------------------------------------------+  
|  4\. GOVERNED ONTOLOGY CORE                                                                         |  
|    \- Ontology Metadata Service (OMS: Schema defining, structural integrity limits)   |  
|    \- Object Set Service (OSS: Read API, securing domain views)                   |  
|    \- Actions Registry (Kinetic authorization schemas, side-effect sandboxes)     |  
\+----------------------------------------------------------------------------------------------------+  
|  5\. COGNITIVE ORCHESTRATION LAYER                                                                  |  
|    \- AutoGen Core (Asynchronous actor model multi-agent communications) \[cite: 13, 41\]              |  
|    \- Semantic Kernel Processes (Stateful execution matrices and checkpoint pipelines) |  
|    \- Model-Agnostic Router (Zero-lock-in hot-swappable API engine client)               |  
\+----------------------------------------------------------------------------------------------------+  
|  6\. SECURED INTERFACE & EVALUATION PLANE                                                           |  
|    \- AIP Evals Execution Suite (Deterministic tests, exact-match validators)        |  
|    \- Operational Cockpit (Checklist-driven Human-in-the-Loop visualization terminal)    |  
|    \- Tamper-Evident Forensic Audit Trail (Cryptographic append-only database logs) \[cite: 18, 47\]  |  
\+----------------------------------------------------------------------------------------------------+

## **Part 8 — Strategic Sequence & Executive Plan**

If an engineering executive inherited years of advanced cognitive AI research and were charged with translating it into a world-class production intelligence system, they must reject the common temptation to immediately fine-tune custom domain models or build complex multi-agent chat networks69. Instead, they must follow a rigorous, logically dependent execution sequence focused on structural data safety and deterministic operational constraints1.  
The exact sequence, designed from first principles, is established below:

### **Step 1: Semantic Grounding (Establishing the Domain Twins)**

The first priority is building the semantic world model7. Before agents can reason, they must have a highly structured environment to reason *over*7. The engineering team must configure the Ontology Metadata Service (OMS), defining the precise "nouns" (objects, properties) and "verbs" (links, action limits) of the domain6. All historical research schemas are normalized and committed directly to this central structural ontology36.  
*Reason*: This step decouples the raw enterprise data from the downstream AI models5. It eliminates hallucination because models are forced to interact with the world via strongly typed, governed schemas rather than flat, unstructured text or unconstrained database pipelines7.

### **Step 2: Physical State Centralization (Deploying the Memory Engine)**

Deploy the federated memory core (PostgreSQL, LanceDB, and Memgraph) to act as the persistent system of record14. The team configures the "Memify" daemon and retrieval-trace optimization (RTO) algorithms, linking vector entry points to explicit graph triplets with structural data-integrity constraints55.  
*Reason*: This establishes a stateful, persistent, and secure memory engine that prevents context window overflow and prevents "cache poisoning" or state drift over long horizons3.

### **Step 3: Action & Permissions Definition (Enforcing Kinetics)**

Map out and code the explicit Action schemas and permissions registry6. The platform implements the Model Context Protocol (MCP) server, mapping every authorized system intervention to highly secure, container-isolated API parameters17. The system implements "Scenario" primitives, allowing agents to execute potential actions exclusively within sandboxed ontology branches37.  
*Reason*: This enforces absolute security37. It mathematically blocks probabilistic models from directly executing unauthorized operations or generating unmonitored side-effects on production systems37.

### **Step 4: Cognitive Loop Integration (OODA & Heuer ACH Engines)**

With the semantic, memory, and kinetic layers fully validated, the team deploys the multi-agent cognitive loop using the asynchronous actor model (AutoGen Core) and stateful execution pipelines (Semantic Kernel Processes)38. Background workers execute OODA loop iterations, and any anomalous claims are routed directly through a Heuer Analysis of Competing Hypotheses (ACH) engine50.  
*Reason*: This pattern forces the system to operate under Karl Popper's falsification model57. It ensures that the platform prioritizes disconfirming evidence over confirmatory bias, producing explainable, analytical decisions based on structural graph traces rather than neural token probabilities47.

### **Step 5: Safety Optimization & Distillation (Establishing the Rules)**

Introduce the Constitutional AI (CAI) and RLAIF self-critique pipelines to align downstream models to the natural language AI doctrine17. Set up the dynamic belief decay cron parameters and integrate the Responsible Scaling Policy (RSP) metrics into the hardware hypervisor stack31.  
*Reason*: This scales safety evaluation, reduces alignment costs, and guarantees that any model upgrades or scaling runs remain subject to automated safety boundaries30.

### **Step 6: Evaluation & Human-in-the-Loop Integration (The Verify Gate)**

Deploy the AIP Evals framework, building precise evaluation suites with exact-match check criteria for every logical process flow7. Interface the final runtime loops with the Challenge-Do-Verify cockpits, ensuring that high-risk strategic operations require documented, multi-signature human approval prior to kinetic execution6.  
*Reason*: This ensures that trust is built on rigorous empirical evaluations and absolute tradecraft compliance, guaranteeing that the platform operates as a secure, transparent, and highly resilient cognitive asset over decades of continuous operation1.

#### **עבודות שצוטטו**

1. Why AI Projects Fail | Common Mistakes, Strategy, and How to Fix Them, [https://athenafusionsol.com/ai-strategy-why-ai-projects-fail/](https://athenafusionsol.com/ai-strategy-why-ai-projects-fail/)  
2. [https://domino.ai/blog/why-ai-projects-fail](https://domino.ai/blog/why-ai-projects-fail)  
3. Why 80% of AI Projects Fail in Production (2026 Guide) \- Kovil AI, [https://kovil.ai/blog/why-ai-projects-fail](https://kovil.ai/blog/why-ai-projects-fail)  
4. Agentic AI's OODA Loop Problem \- IEEE Computer Society, [https://www.computer.org/csdl/magazine/sp/2025/06/11194053/2aB2Rf5nZ0k](https://www.computer.org/csdl/magazine/sp/2025/06/11194053/2aB2Rf5nZ0k)  
5. Palantir's Secret Weapon Isn't AI — It's Ontology. Here's Why Engineers Should Care., [https://dev.to/s3atoshi\_leading\_ai/palantirs-secret-weapon-isnt-ai-its-ontology-heres-why-engineers-should-care-kk8](https://dev.to/s3atoshi_leading_ai/palantirs-secret-weapon-isnt-ai-its-ontology-heres-why-engineers-should-care-kk8)  
6. The Palantir Impact: Ontology Strategy Connecting Data and AI \- GitHub, [https://github.com/Leading-AI-IO/palantir-ontology-strategy/blob/main/docs/the-palantir-impact\_en.md](https://github.com/Leading-AI-IO/palantir-ontology-strategy/blob/main/docs/the-palantir-impact_en.md)  
7. Inside Palantir AIP: How the World's Most Controversial AI Platform Actually Works, [https://towardsai.net/p/machine-learning/inside-palantir-aip-how-the-worlds-most-controversial-ai-platform-actually-works](https://towardsai.net/p/machine-learning/inside-palantir-aip-how-the-worlds-most-controversial-ai-platform-actually-works)  
8. 6 Reasons Why AI Projects Fail and How to Fix That \- Airbyte, [https://airbyte.com/agentic-data/why-ai-projects-fail](https://airbyte.com/agentic-data/why-ai-projects-fail)  
9. Why AI Projects Fail \- Prosci, [https://www.prosci.com/blog/why-ai-projects-fail](https://www.prosci.com/blog/why-ai-projects-fail)  
10. Memgraph, [https://memgraph.com/](https://memgraph.com/)  
11. Agent Feedback Loops: From OODA to Self-Reflection | by Tao An | Medium, [https://tao-hpu.medium.com/agent-feedback-loops-from-ooda-to-self-reflection-92eb9dd204f6](https://tao-hpu.medium.com/agent-feedback-loops-from-ooda-to-self-reflection-92eb9dd204f6)  
12. Context graphs: Why AI agents need three types of memory \- Neo4j, [https://neo4j.com/blog/agentic-ai/context-graph-ai-agent-memory/](https://neo4j.com/blog/agentic-ai/context-graph-ai-agent-memory/)  
13. AutoGen \- Microsoft Research, [https://www.microsoft.com/en-us/research/project/autogen/](https://www.microsoft.com/en-us/research/project/autogen/)  
14. Introducing Oracle AI Agent Memory: A Unified Memory Core for Enterprise AI Systems, [https://blogs.oracle.com/database/introducing-oracle-ai-agent-memory-a-unified-memory-core-for-enterprise-ai-systems](https://blogs.oracle.com/database/introducing-oracle-ai-agent-memory-a-unified-memory-core-for-enterprise-ai-systems)  
15. Why enterprise AI projects fail, and how to avoid costly AI implementation mistakes \- Nortal, [https://nortal.com/insights/why-most-ai-projects-fail](https://nortal.com/insights/why-most-ai-projects-fail)  
16. Introducing enterprise multi-agent support in Semantic Kernel \- Microsoft Developer Blogs, [https://devblogs.microsoft.com/agent-framework/introducing-agents-in-semantic-kernel/](https://devblogs.microsoft.com/agent-framework/introducing-agents-in-semantic-kernel/)  
17. Anthropic: Claude, the LLM betting on reliability | KERN-IT, [https://www.kern-it.be/en/definitions/anthropic/](https://www.kern-it.be/en/definitions/anthropic/)  
18. constitutional-ai · GitHub Topics, [https://github.com/topics/constitutional-ai](https://github.com/topics/constitutional-ai)  
19. Prediction and Judgment: Why Artificial Intelligence Increases the Importance of Humans in War | International Security \- MIT Press Direct, [https://direct.mit.edu/isec/article/46/3/7/109668/Prediction-and-Judgment-Why-Artificial](https://direct.mit.edu/isec/article/46/3/7/109668/Prediction-and-Judgment-Why-Artificial)  
20. Autonomous AI Systems Face to Face with the Law of Armed Conflict \- NATO, [https://publications.sto.nato.int/publications/STO%20Meeting%20Proceedings/STO-MP-IST-210/MP-IST-210-3.02.pdf](https://publications.sto.nato.int/publications/STO%20Meeting%20Proceedings/STO-MP-IST-210/MP-IST-210-3.02.pdf)  
21. Responsibility and Lethality for Unmanned Systems: Ethical Pre-mission Responsibility Advisement \- UNL Digital Commons, [https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1167\&context=csetechreports](https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1167&context=csetechreports)  
22. AUTONOMOUS WEAPON SYSTEMS \- ICRC, [https://www.icrc.org/en/download/file/1707/4221-002-autonomous-weapons-systems-full-report.pdf](https://www.icrc.org/en/download/file/1707/4221-002-autonomous-weapons-systems-full-report.pdf)  
23. A Multi-agent AI System for Deep Learning Model Migration from TensorFlow to JAX \- arXiv, [https://arxiv.org/html/2603.27296v1](https://arxiv.org/html/2603.27296v1)  
24. Using JAX to accelerate our research \- Google DeepMind, [https://deepmind.google/blog/using-jax-to-accelerate-our-research/](https://deepmind.google/blog/using-jax-to-accelerate-our-research/)  
25. Differentially private machine learning at scale with JAX-Privacy \- Google Research, [https://research.google/blog/differentially-private-machine-learning-at-scale-with-jax-privacy/](https://research.google/blog/differentially-private-machine-learning-at-scale-with-jax-privacy/)  
26. (PDF) OpenAI GPT-5 System Card \- ResearchGate, [https://www.researchgate.net/publication/399558808\_OpenAI\_GPT-5\_System\_Card](https://www.researchgate.net/publication/399558808_OpenAI_GPT-5_System_Card)  
27. GPT-5 System Card Unpacked: Safety, Speed, and Real-World AI \- The Prompt Index, [https://www.thepromptindex.com/gpt-5-system-card-unpacked-safety-speed-and-real-world-ai.html](https://www.thepromptindex.com/gpt-5-system-card-unpacked-safety-speed-and-real-world-ai.html)  
28. OpenAI's New Codex Security: Architecture & Implementation \- LockLLM Blog, [https://www.lockllm.com/blog/codex-security](https://www.lockllm.com/blog/codex-security)  
29. GPT-5.4-Cyber, Trusted Access for Cyber \- Penligent, [https://www.penligent.ai/hackinglabs/gpt-5-4-cyber-trusted-access-for-cyber/](https://www.penligent.ai/hackinglabs/gpt-5-4-cyber-trusted-access-for-cyber/)  
30. Constitutional AI: Harmlessness from AI Feedback \- Anthropic, [https://www-cdn.anthropic.com/7512771452629584566b6303311496c262da1006/Anthropic\_ConstitutionalAI\_v2.pdf](https://www-cdn.anthropic.com/7512771452629584566b6303311496c262da1006/Anthropic_ConstitutionalAI_v2.pdf)  
31. Deconstructing Constitutional AI 2.0: Technical Changes in Anthropic's Post-Pledge Architecture | by Niko Mao | Medium, [https://medium.com/@nikomao89/deconstructing-constitutional-ai-2-0-technical-changes-in-anthropics-post-pledge-architecture-6eba6e64479a](https://medium.com/@nikomao89/deconstructing-constitutional-ai-2-0-technical-changes-in-anthropics-post-pledge-architecture-6eba6e64479a)  
32. claude-code-templates/cli-tool/components/skills/ai-research/safety-alignment-constitutional-ai/SKILL.md at main \- GitHub, [https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/skills/ai-research/safety-alignment-constitutional-ai/SKILL.md](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/skills/ai-research/safety-alignment-constitutional-ai/SKILL.md)  
33. Ontology MCP • Overview \- Palantir, [https://palantir.com/docs/foundry/ontology-mcp/overview/](https://palantir.com/docs/foundry/ontology-mcp/overview/)  
34. AI Research Engineer Interview Guide: OpenAI, Anthropic, DeepMind (2026), [https://www.sundeepteki.org/advice/the-ultimate-ai-research-engineer-interview-guide-cracking-openai-anthropic-google-deepmind-top-ai-labs](https://www.sundeepteki.org/advice/the-ultimate-ai-research-engineer-interview-guide-cracking-openai-anthropic-google-deepmind-top-ai-labs)  
35. GitHub \- google-deepmind/penzai: A JAX research toolkit for building, editing, and visualizing neural networks., [https://github.com/google-deepmind/penzai](https://github.com/google-deepmind/penzai)  
36. Overview • Ontology \- Palantir, [https://palantir.com/docs/foundry/ontology/overview/](https://palantir.com/docs/foundry/ontology/overview/)  
37. Platform overview \- Palantir, [https://palantir.com/docs/foundry/platform-overview/overview/](https://palantir.com/docs/foundry/platform-overview/overview/)  
38. Microsoft's Agentic Frameworks: AutoGen and Semantic Kernel, [https://devblogs.microsoft.com/autogen/microsofts-agentic-frameworks-autogen-and-semantic-kernel/](https://devblogs.microsoft.com/autogen/microsofts-agentic-frameworks-autogen-and-semantic-kernel/)  
39. Basic of Agent \- Microsoft Agent Framework | Agent Innv Lab \- Azure documentation, [https://azure.github.io/agent-innovator-lab/0\_basic-agent\_AgentFramework/](https://azure.github.io/agent-innovator-lab/0_basic-agent_AgentFramework/)  
40. Building Multi-Agent Orchestration Using Microsoft Semantic Kernel: A Complete Step-by-Step Guide, [https://techcommunity.microsoft.com/discussions/azure/building-multi-agent-orchestration-using-microsoft-semantic-kernel-a-complete-st/4507660](https://techcommunity.microsoft.com/discussions/azure/building-multi-agent-orchestration-using-microsoft-semantic-kernel-a-complete-st/4507660)  
41. ​​Microsoft AI Agents: A Deep Dive into Frameworks and Platforms | Devoteam, [https://www.devoteam.com/expert-view/microsoft-ai-agents/](https://www.devoteam.com/expert-view/microsoft-ai-agents/)  
42. Leveraging Artificial Intelligence in Modern Defense: Integrating Generative AI, Cybersecurity, and Military Doctrine Transformation \- International Journal of Engineering Research & Technology, [https://www.ijert.org/leveraging-artificial-intelligence-in-modern-defense-integrating-generative-ai-cybersecurity-and-military-doctrine-transformation](https://www.ijert.org/leveraging-artificial-intelligence-in-modern-defense-integrating-generative-ai-cybersecurity-and-military-doctrine-transformation)  
43. MILITARY DOCTRINE AND TECHNICAL-MILITARY COOPERATION AS DRIVERS OF INDUSTRIAL DEVELOPMENT IN DEFENSE: STRATEGIC LESSONS FROM SOU, [https://sevenpubl.com.br/editora/article/download/8326/14312/32781](https://sevenpubl.com.br/editora/article/download/8326/14312/32781)  
44. Claude's Constitution \- Anthropic, [https://www.anthropic.com/constitution](https://www.anthropic.com/constitution)  
45. Claude's New Constitution: AI Alignment, Ethics, and the Future of Model Governance, [https://bisi.org.uk/reports/claudes-new-constitution-ai-alignment-ethics-and-the-future-of-model-governance](https://bisi.org.uk/reports/claudes-new-constitution-ai-alignment-ethics-and-the-future-of-model-governance)  
46. Fine-tune large language models with reinforcement learning from human or AI feedback, [https://aws.amazon.com/blogs/machine-learning/fine-tune-large-language-models-with-reinforcement-learning-from-human-or-ai-feedback/](https://aws.amazon.com/blogs/machine-learning/fine-tune-large-language-models-with-reinforcement-learning-from-human-or-ai-feedback/)  
47. Meet Lenny's Memory: Building context graphs for AI agents \- Neo4j, [https://neo4j.com/blog/developer/meet-lennys-memory-building-context-graphs-for-ai-agents/](https://neo4j.com/blog/developer/meet-lennys-memory-building-context-graphs-for-ai-agents/)  
48. Dynamic Belief State Planning Framework for Ambush Avoidance in Contested Environments: A Game-Theoretic Approach \- ResearchGate, [https://www.researchgate.net/publication/401249104\_Dynamic\_Belief\_State\_Planning\_Framework\_for\_Ambush\_Avoidance\_in\_Contested\_Environments\_A\_Game-Theoretic\_Approach](https://www.researchgate.net/publication/401249104_Dynamic_Belief_State_Planning_Framework_for_Ambush_Avoidance_in_Contested_Environments_A_Game-Theoretic_Approach)  
49. Overview of Structured Analytic Techniques | PDF | Intelligence Analysis \- Scribd, [https://www.scribd.com/document/968704511/att-sb1-107812](https://www.scribd.com/document/968704511/att-sb1-107812)  
50. Deepfield: a modular assessment platform \- Syntheos, [https://www.syntheos.io/work/deepfield](https://www.syntheos.io/work/deepfield)  
51. Analysis of Competing Hypotheses \- Rodolfo Santos Flaborea \- Medium, [https://anticitizenone.medium.com/analysis-of-competing-hypotheses-176bd8147dbc](https://anticitizenone.medium.com/analysis-of-competing-hypotheses-176bd8147dbc)  
52. Mastering the Analysis of Competing Hypotheses (ACH): A Practical Framework for Clear Thinking \- SOS Intelligence, [https://sosintel.co.uk/mastering-the-analysis-of-competing-hypotheses-ach-a-practical-framework-for-clear-thinking/](https://sosintel.co.uk/mastering-the-analysis-of-competing-hypotheses-ach-a-practical-framework-for-clear-thinking/)  
53. Tracing the Untraceable: Language Pattern Analysis, IP Attribution, and Decloaking Techniques in Fraud Investigation | by Brian James Curry | Jun, 2026 | Medium, [https://medium.com/@brian-curry-research/tracing-the-untraceable-language-pattern-analysis-ip-attribution-and-decloaking-techniques-in-27b03df651b4](https://medium.com/@brian-curry-research/tracing-the-untraceable-language-pattern-analysis-ip-attribution-and-decloaking-techniques-in-27b03df651b4)  
54. Used AI to Turn an Intel Analysis Book Into a System That Uncovers Overlooked Information from the Epstein Files \- Reddit, [https://www.reddit.com/r/artificial/comments/1pmkhn0/used\_ai\_to\_turn\_an\_intel\_analysis\_book\_into\_a/](https://www.reddit.com/r/artificial/comments/1pmkhn0/used_ai_to_turn_an_intel_analysis_book_into_a/)  
55. How Cognee Builds AI Memory for Agents, [https://www.cognee.ai/blog/fundamentals/how-cognee-builds-ai-memory](https://www.cognee.ai/blog/fundamentals/how-cognee-builds-ai-memory)  
56. Joint Doctrine Encyclopedia \- Berlin Information-center for Transatlantic Security, [https://www.bits.de/NRANEU/others/jp-doctrine/jp-encyclop%2897%29.pdf](https://www.bits.de/NRANEU/others/jp-doctrine/jp-encyclop%2897%29.pdf)  
57. Does Analysis of Competing Hypotheses (ACH) Really Mitigate Cognitive Biases? Practical Implications for Intelligence Analysts and Criminal Investigators, [https://www.kicj.re.kr/boardDownload.es?bid=0034\&list\_no=12219\&seq=1](https://www.kicj.re.kr/boardDownload.es?bid=0034&list_no=12219&seq=1)  
58. Chapter 2: Methodology | The Heritage Foundation, [https://www.heritage.org/tidalwave/chapters/chapter-2-methodology](https://www.heritage.org/tidalwave/chapters/chapter-2-methodology)  
59. mantisfury/ArkhamMirror: Local-first AI-powered document intelligence platform for investigative journalism \- GitHub, [https://github.com/mantisfury/ArkhamMirror](https://github.com/mantisfury/ArkhamMirror)  
60. Engineer Operations Above Brigade Level | PDF | United States Army \- Scribd, [https://www.scribd.com/document/50830551/ATTP-3-34-23](https://www.scribd.com/document/50830551/ATTP-3-34-23)  
61. Aviation Risk Management Workbook | PDF \- Scribd, [https://www.scribd.com/document/259660761/Aviation-Risk-Management-Workbook-USFS](https://www.scribd.com/document/259660761/Aviation-Risk-Management-Workbook-USFS)  
62. Boeing Checklist Philosophy Overview | PDF | Takeoff | Cockpit \- Scribd, [https://www.scribd.com/document/486653189/Boeing-Checklist-Philosophy](https://www.scribd.com/document/486653189/Boeing-Checklist-Philosophy)  
63. (PDF) Towards a Science of Checklists \- ResearchGate, [https://www.researchgate.net/publication/317397736\_Towards\_a\_Science\_of\_Checklists](https://www.researchgate.net/publication/317397736_Towards_a_Science_of_Checklists)  
64. MetaRCA: A Generalizable Root Cause Analysis Framework for Cloud-Native Systems Powered by Meta Causal Knowledge \- arXiv, [https://arxiv.org/html/2603.02032v1](https://arxiv.org/html/2603.02032v1)  
65. ArkhamMirror: Airgapped investigation platform with CIA-style hypothesis testing, [https://news.ycombinator.com/item?id=46286666](https://news.ycombinator.com/item?id=46286666)  
66. Modeling Situation Awareness in Human-Like Agents Using Mental Mod \- IJCAI, [https://www.ijcai.org/Proceedings/11/Papers/285.pdf](https://www.ijcai.org/Proceedings/11/Papers/285.pdf)  
67. Bayesian Epistemology with Weighted Authority: A Formal Architecture for Truth-Promoting Autonomous Scientific Reasoning \- arXiv, [https://arxiv.org/pdf/2506.16015](https://arxiv.org/pdf/2506.16015)  
68. The OODA Loop Pattern for Autonomous AI Agents — How I Built a Self-Improving System, [https://dev.to/yedanyagamiaicmd/the-ooda-loop-pattern-for-autonomous-ai-agents-how-i-built-a-self-improving-system-2ap3](https://dev.to/yedanyagamiaicmd/the-ooda-loop-pattern-for-autonomous-ai-agents-how-i-built-a-self-improving-system-2ap3)  
69. Palantir in AEC \- AEC Magazine, [https://aecmag.com/construction/palantir-in-aec/](https://aecmag.com/construction/palantir-in-aec/)  
70. Why 95% of AI Projects Fail and What Comes Next \- MediaSupplyChain.org, [https://mediasupplychain.org/why-95-of-ai-projects-fail-and-what-comes-next/](https://mediasupplychain.org/why-95-of-ai-projects-fail-and-what-comes-next/)  
71. Claude Implementation Guide: Enterprise Deployment (2026) \- Opsio, [https://opsiocloud.com/blogs/claude-implementation-enterprise-guide/](https://opsiocloud.com/blogs/claude-implementation-enterprise-guide/)  
72. Introducing gpt-oss \- OpenAI, [https://openai.com/index/introducing-gpt-oss/](https://openai.com/index/introducing-gpt-oss/)  
73. AI and the OODA Loop: Reimagining Operations \- F5 Networks, [https://www.f5.com/company/blog/ai-and-the-ooda-loop-reimagining-operations](https://www.f5.com/company/blog/ai-and-the-ooda-loop-reimagining-operations)  
74. AIP overview \- Palantir, [https://palantir.com/docs/foundry/aip/overview/](https://palantir.com/docs/foundry/aip/overview/)  
75. Governing the Agent \- Genesis: Human Experience in the Age of Artificial Intelligence | Synthesis: The Superintelligence Protocol, [https://genesishumanexperience.com/2026/05/20/governing-the-agent/](https://genesishumanexperience.com/2026/05/20/governing-the-agent/)  
76. Constitutional AI: Principles, Practices, and Implementation in Large Language Model Development \- ResearchGate, [https://www.researchgate.net/publication/395460218\_Constitutional\_AI\_Principles\_Practices\_and\_Implementation\_in\_Large\_Language\_Model\_Development](https://www.researchgate.net/publication/395460218_Constitutional_AI_Principles_Practices_and_Implementation_in_Large_Language_Model_Development)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAZCAYAAADe1WXtAAAAfklEQVR4XmNgGAWjYMCBLBB3AzEHugQlgB+INwOxJroEpaAciqkOzIBYBV0QGfAAsSQZ+BEQJwExJwMWUMEAUUAq/g/Er4A4noFKgBuI+xhwuJIcwALEU4GYEV2CXAAycCEQe6BLUAKkGSDpVARdghLACsRCDFT0+igYBQQAAC92Ft8h9ZYxAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,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>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAABBCAYAAABsOPjkAAAEwElEQVR4Xu3dTaitUxgH8CUUIeTmI4qkJAxQigwpBgxQFHMfkTIgSikZGF2ZKClfMcBEiAG5MVGUKBmpy0QSSozkY/1737ezzjp7n+24e1/OPr9fPZ39rr3PPu/dd/L0PM9auxQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFiCE2oc2S+Ojqtxdr+4JHnfE/tFAAC2uqfGD/1idVSNJ/vFJdtf4+h+EQCAra6tcUW39kqNG5rrc2t801wvcnKNO/rFTv7um/0iALCeTqpxTL/Y0Hrb3r4aj3drn5QhSZtcXePr5nqRC8rWJLB3Zo2P+0UAYP3cWOOcfnGGz8vq5rHWwW9lqHhNXq5xRHP9do2Hm+tFniqbf3+eF/oFAGC9JAH7ql8sQ6JwXrf2ao1nurV1d3GNm2fENe2LylCB/LXGc81an0ilHZoq26R/z+l9jy1DOzQVusmVZf6sWv93AIA183MZhuZ7D47RSiLx7viTDe/VeKDGRTV+bNZnVdjSdu4T4Vluq/FljdNqvD+uPbbx9CYSNgBYc0kwMivVe71srgZNMgS/aK5qLzm9DFXHVL+SjCUpy+7Q+KDG8ePjPJcZtyRwF45r20k7NP8H+bzTio4+gY68f/4OALBLXV6GIfe01pIApPX5YY1TxuczEP/s+HiS5OCvLlpnlCGRmJKSVfm0DPd+fhnu/aMy3PuypVp4b42DZage3r3p2cVyzlorCdm0eaPfJbpoY0cvyVg+7wPj9ayELTNzKmwAsEtlpuqtGteXIelK2zNzUXl83fiaq8rWJODUMiQJeV1+piXXShKR5CmHxc7Tz2XNi33TL3Ry72kv5t5/KcO9v1O2Jo/LkGS23bk5a57v38o82ov94g7l835tfDzrTLfny9Z5OgBgl0hSlkg17M9xLafxt/NTSYgSvVTeMj81T4bnk8ytSu47Fby2LZvkMvd+XxlakH1la5azavxRNle5Wo+WjWphqo7ZLXtX+4IlWNY3HSSR7r9NwTcdAMCaSOJ1sF8c3VpmJ2xJmNrdjr1VJ2yR6lvuPeeMTZKc3FKGxCWzYouSlSR7qcqlpdqbdmH+VOPbMpxl9simVwAAHCZJWPq25yTJ2v3dWlpwB2pcVoZ5rFSdWnk+LcS+VdrqZ+DmxaxNDZPcc9sCzb20uy5TGevn73YiCWcSz1ThAAD+M2n1/V6GduIsScr60/nTDv2uDBWo7Gbsv/Yo6znG4p+0JA9FErLc+2RKJCcZtG+vdyrVuVTV+oTtoe4aAGClkpCltdmeBdZKQpe2Yzv8n+Mpni7DIbnT5oRW5sHa0/xXJd8a0LZll52wRf6t2dTwRo0vanxW5n9WAAArkVmveafjTzKUP6s1Oa/lmXmwec8tU5LI9t5T0Utlb5KELXNshyrHbKQ9moQQAOB/6fYa3/eLc9xZtt89umo5vmJKFlMNc5wFALAnpIo1ndS/SJK1m/rFwyj3+FKNS2s8MV4DAOwZ+2tc0i828l2Z5rsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFgffwPzjqOf+xhCfAAAAABJRU5ErkJggg==>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAZCAYAAAA8CX6UAAAA10lEQVR4Xu2SMQrCQBBFR1QQFLWz9wiWClZaeAKvYGfpGSxsBBuxEREbWzuLBQ/gMSzEM+j/ZKJLog4BwWYfPLLzE2Yzm4gEAr+lbtQmNbiHE3iHV9iGHehg5fmkQQ8u4VyiRiPNZ3AHC1qbDGAXnuAFNjWvwrJexxJtxtrkBg+w5GUcm9kQ5nXN7Csci2/ns1VzWvMsV6/baXig/lgxDq69mmtmHz8AGyTHIk4yNuL8NMlR0o3ebWjCX4LN4q/lNMtMH55hQ2uumWWmCBdwA1twqlngnzwAwyQkuhMI4doAAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAZCAYAAAA4/K6pAAAA5ElEQVR4XmNgGAVUBSxAvByIfwKxJZocUUAaiB9AMYhNMrAB4t9AvBWIOdDkiALlQPwfiHPQJQgBHiCWBOLnQHwDiLWhfJLBPyBeCsSM6BLEApDz05H4fECcD8SzgDgPSRwr4Abir0BsjCQGCsxwIGaG0vxIchjAD4jnMyCcLwvEy5D4oDQyB8rGClqBOBrKBmmaDMQLEdJgcIABEuBYwSQGSOoDaQY5dwYDiQaAgDgQC0DZoDBBN4DkBLaHAWIQCIBsBrmSJHCeAeIqEADRrkhyRIGpQLwYiI0YIDHCiio9CqgGACygH7C2GF1xAAAAAElFTkSuQmCC>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFMAAAAaCAYAAADL5WCkAAADF0lEQVR4Xu2YTahOURSGX6EIEfJTxC3KXyk/AzJk5GeAUAzMTIwoJtKdmAshP4kSRUlRkvTFCAMRGalLYoQoujf5ed+Wc31W+5yzz75f93Rv56m3213rO9/+zrvXXvucDTQ0NKQxkRrtg4OAxtTYw4a91HHUY6aMvElt9okYFlEfqM/UYZeriyfUNB+EmTufWuYTCei75lIjXFzMoZ75YCyajQfUb5+ogXnUOh8kG6iP1C3qPHUV6ctxJPWYalHj/0/1swtmahI7YWaO8olBRFVylBrrE+QHtRv/KknVewHVWsFa6j31C3avLeSbqYnSbwlVbiky8QqsX1VFM72Neg27yTPUMdgEbW37XBkaWy3Hs5y6TY1pi22EGaJxUigzU6j17fHBWDahfIAQp6gbVJdPVEBGybB7PgGblIsuJoO/Ie33ihgzVRjXkbhap1N91CqfKEDLQJVYZbmFmEm9oc75BDmIfDN1ja6tSoyZl6mX1FSfiEHGaJBuFy9iCTXFBxPIzJFxHi3lOsw8Atv0FvpEDCuoXliDVrOO4STsZooUQ9YD9dejaq3DTE1sFS/6WQ1r/t2wgU4gbifTjvq2RDEUmVnXMte4eb8pFzn/iToA65fqm69gPbQM9ctOUGRmaANaSX2nHlITXC6GWDM1hsaKYj1shrNNRM94d2CDaXcvYwfiKriMNbBnyX0+Actplx/XFsvM18pIGT/WTHmjVVCK3j/vU5NdXA1Xjfedi+fxHNWeAEJox9TOqR00xE9qe9v/emOTsrcgmdKCmdTzN5aHnov1uacofsvJHtXaJzHIJOoRwl+WPcBrwBhk/gvqErXU5WJRdanKZGiIQ9QX2PmBlr3G06tnhq7fDzNdhRAi67O6L68QPbAdPQoZmoeWvHpm7BLS57X01CJ0Q2U/NITaivp1HrNhb1QyU9UVQoVw1gcT+YqBr7ja0EmRKm4gqACu+WACKiIVRuicYMig05ouH6yAru/EUeJihE+vhhx3qS0+GIE2sVk+mIDG1uYzLJhBnUZnjKnKAtjRW+pZaUNDQ0NDAX8ASpetkpUtI8QAAAAASUVORK5CYII=>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAaCAYAAABozQZiAAAAuElEQVR4XmNgGLmAFYgLgXgWkVgIog0CdID4PRCvRFKwGYj/AfFkIA4B4jKo/DcgVoJog4ByIN6HLAAE0UD8H4gFsYjDxUC2LgViTrg0RPI0A0QzOghC5iQAcQayABAYA/FXIH6LJg4CRegC6ADmZJDtJAFGIJ7PANE8CU2OIEB2siaaHEGQzoBwMnpI4wUUOVkEiK8yQDSDAo0kUM8A0XgFiBVQpbADcSC+ywDRhA2DXDMKRgF5AADUly50n9xS5QAAAABJRU5ErkJggg==>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAABOCAYAAACdbkoxAAAEhUlEQVR4Xu3dW6ilYxgH8FcOOQ0moimFiSTkTCO5GKNIzcWkKHLrhhs1KTem5F6O5ZBcOCs0xIW05Y7CBZGoIeXChZJRYzI8j+/7rHe/e+3DzKw1s7b9+9W/1ve8e62Zy6fvPZUCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMCac0TkkrY4YSdFrm+LAACszKbInsiR7cAEvVy6fwMAgAPwRmRfW5ywvZF32yIAACuzK/J1W5ywvyP3tEUAAJZ2emRD6Zqp7ZEzIkfP+4uDl79/eeSbyIWRU+YPAwCwnGMjf0SuagcmaEvkxdJtbgAAYD/dHHm+LN1M3Rv5cZm8Hjlx+ELlhMgHkSv655NLt5YtNzjc1j8DALCIbLDmyqiZ2hY567/RydhauinXoSH8OPJS//moyLP9ZwAAxtgY+Tmyvn/eGTl1NDwRD5euYUvZtOXmhhdGw/82jOPezAEATFwups8F9oN1Zf40Yy7mf6KptXIs13odqmnC/D89FXkt8l0zNilXRn6JfFS6s9jmioYNADjEssnaHPm9dGu5PomcH3muHxtkY5S15TwUea8tTtk0dofW8reH3aG5nq1u2HI9W258AACYmt8i11TPuS4r3yTVuy7z+Iwd1XMtpwt3NLXby2hd2f/NjZHP+8/ZKOYzAMDUnFO6WwKySavdHTmtes4DYy+qngf5Bi4btlyYX8tG5vGy9PTpajVMDefZbLn5YJpv9gAAyn2R7yPnNfX67Vh+3l0913Ls/chx7UAZ38gBALCf8kDYbKz+itxZujdjrTvKaJfkINe4Za1OOwWaTV7usAQA4CDdFfmyjBqvXyOXVeO5wD6PzmjllOlXkTPbgV6OzbXFXk6VXhu5dQW5pf8OAMCal/dkPlO6pu2Bqp4N2w/V8+C6yN6y+A7JuT7TlLcczFoAACbmrTL+/LBs2O6vnhdr2HKzQjZsi8kbAebaIgAAK/dmWbjDMacq90Q2VbVs2PLoj9auPil/p71hIJu8PLNsnOMj75SF6+DGJQ+tBQBYc3L9WTZD9T2YZ0c+LQtvKchpvvzb1r7Ig5FzI283YynfvuXxIAAAHIBcf3ZD6d6A5dTo05E/I4/Vf9TLs9p+aoulu80gNyN8Ebm0GUu5eWHc2W0AAExBnuZ/U1tcQjZqedvBLBo2S7xaukb1lf453xLmESZPlm7X7KPDFwAAVoNco7azjD8gt5Xr4B4p4zc0zIJsxD6snocGrj5HLtfjmc4FAFadqyPftsUxPotsa4szJDdR1Fdx5eXt7Rq99ZELmhoAwKqQTcy6tlg5JrK5Lc6Ydqo21+e1DduGMv8uVQAADqNs1ubaIgAAsyHX2WXD5s5TAIAZtbV0R5NsbAcAAJgNuWM0Nx0sdh8qAACHUR7jsTuypR0AAGA2bC/d+rWLS3d2HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwdf8AvY+zJIL4OUIAAAAASUVORK5CYII=>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAaCAYAAABLlle3AAABlUlEQVR4Xu2UPSiFURjHH6GI8hmKhTKYDFY2i0FJGSSjLFYpm2QzmUlIBpNBGcXNQMliUQopgxiEyOf/f59z7jn36H51e7O8v/oN93mec97nPed5r0hMTHa64Bm8gc9BLjIa4RA8gD9BLlIq4C58CBNR0g+/4VKYyEY5rA+DBbAgerRjsEl0v4y0wFV4D0/hKFwRHY58sUf7CtdF9+Exj8MSry7FJVyGleb3F/yAvamK3HTAO9E3nTOxKfgO+2yRZUb+3sGTaNfsPl9mxR2tZdjE1rxYcszPRQfAh4VsphDYJJvt9mL2jnmKKXrgC2zzg6ITGDaSC17RCawzv6vhvuhDJ00siX0oCyxcdAVbRQdpxMtl4xpuihsaruUg3cJ2W0Q4OHviumPhhegd1MBtcQsYY9dsks2GbIm+mX2BR7goGT4bPugQ7sBj0TvhFB7BaXGdcyje4CccNDEfXlFC3F4TsDStIoAfMrVFDbDWpdOYhwNh0MD13Kc5TBQDr2NDCvvTKBp+5Bz/sjARFVWwMwzGxPwLv0nGSo3oL69xAAAAAElFTkSuQmCC>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAABACAYAAACnZCtBAAAEMElEQVR4Xu3dS6htcxwH8L+ivEooj5BHUhiQZ0QiisIAxQBT0r0TA8roSJKiZEwykDwGSpKoe8PAK6+8SuoSZhIhr/D79V/LWWvdvTt7b3ftk30+n/q2117/s89dZ4++/f//tW4pAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsHVcFXki8kPk98hF/eE9br/I35FbhwMAAEz2ZPN6ROSDyLGdsTFcXmph+2g4MHBk5PzhSQCA/7MDI88NT85gLXLc4NxYrom8G9lZamk7rDfa93OpPwcAsDIWLWznRV6JHDQcGMGOyI2lFre/Itv6wz1Z6B4engQAVttekWsj70c+idwUub/3E8uTy4+PljqDtCvyQHdwQYsWtvwOshxlgRpTXl+WtVa7NDqU57p5vD8MAKyyLEW/Nsf7lFoGdv07urEsfNfNmAOaz0zzVVkvV+eUycVlXosUtksid5e6jy2vYcxZtpxV6/7+9uaDYzrnUu5duyLycqn76fLvAgC2gFMj30VO7pzLsnBn5/0yZOl7qPSX+g4vtTjm2LnN2Fmd8Wnyc1lu2pwYeWlwLjOt8LwR+bo5Pro5PnN9eCb5uU8jVw8HBm4odTl06PnI56Vf2vaOPBu5tHMOANgC1iIvRPZt3mcp+CNyQfP+weZ1bMeXWoy6ZSSvIQtKLte+GDmked3Ix6XO1LXJ3/vn4Fxme/uBgVwCfaw5zmL3ZakFbB75d+Tv2Wiv2aulzrANXVZ2L85ZRL+IHNU5BwCsuJxh2lkml6QsbteX2ZZG9y+776+alpzRmySfeZbj3eKY15HX833zmvL1tOZ4VvMuif4SObs5zpm1vCtzDIeWyWWt9VvpLwlneeu+z1IHAKy4LEc5u9Yu9+XS4z2R2yOnRL4pdWYq93KNrZ2RauUy5relzirlNeQdmymvNcvdPOYtbN0ZxrVSryO/mytL3ej/SOSkZvy/yBsNTih1Fi/3Dg49XWpBy9nHlAU2ry3lPrcLm2MAYMVlUcg9bFlEcvnujMhnkXcib0duWf/R0Z0eeS3yTOTiUovijlJnvNpSuYzClrNruX/sqchtpZa1fJhtuzx5b1mfCVxU7l0bzj5OSy7pZmnL2bi8OeS9snl38QIAmyQLTc7ytHJWK8/lfql2aXBZ8oGx3YfG5vGPpV/Y5t10P29hS1nSut/JT6V+F+2s5GbJf3/azRIAwBbU7mWbtyDtaXnH5LbmOF9zOXDZ3oocHLmj1CXSXDoe81EfAAAzeT1yX6mzTZspH+XxYak3QeQjNzZD/ifw+V3cFXkzcnN/GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYzz+xW7Q4/q1tLwAAAABJRU5ErkJggg==>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAABACAYAAACnZCtBAAAEDUlEQVR4Xu3dS6h1YxgH8EcoohCRgfhkIgNyGbgORJEYoCimwkiRxOgrGRiYmCiJZOQy8ylJOeSaAYUMMJEYSCQMlMvzePdqr73O3ufsc9n7nM/+/erfWft992q/Z5/J03tZJwIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAID/s28z32VuHHYs0X4YQzk+cyjzzyjHTHbvqmszn2dOHXYAAAzdlfk5c+6wY4n2wxjKNZkjMrdlfhpdL8KxmdejFYX3DPqGzs+cM2wEAFbLHdEKh720iDE8P2yYw4HMw8PGBXgrWqH2d2z+e1f/Q8NGAGC1PBebFw2LtogxbKdgOyrz17BxAd7NnJxZi/Z7nzbRO1bjqaKuZv4AgBX2R+bjaPupPs1cP9m9FIsYw1YLtlr+vCrzZ+adzAmT3bvm5mjFWumWRr+MyaKt+rt9dF32en8fALCHqhj4PVrBUvkxc97EO2a7LHPrHLkhc9zonmmmjWGntlqw1Szf15lLo43n9snuXVGHGmo5tO+6WL/seWTm9MzjmQdH10f3+gGAFXJK5ofM2b22Kh62WuzsxKwx3Jd5OjYu9DonRitq+nl5StusE5lVnB3sva7Pfy9aEXlRr32WB6LdUwXZRmrmrmbYhmoZdrgkXN9HfS/1/QAAK+yKzGsxfnxF/azC4bHMM92bFmzWGOqkZs00Vd9Gy5O1z+uJaI8G6aeWNodtb4/u6euWJfuFWX3+I5kvYr6CqcZY92x2yrVm16YVda9Gu/+MXlstC1fbok6qAgCHiVqG6++NquW52kd2ebSlwc0cilZUbJaNllmnjeGXGBcqr8T2isd5ZwmrUOuWY0v9rGfCXZC5u3vTLrgzphdrpZY7X8p81WtbizauUmM6c9wFAKyS+zOXjK67oqE2/9dero+izXAt2rQxfDbu/q/wWuu9nte8BVtt9v8m2kxdOZB5NHNxtJmvZ2PnhyDqEMH7MV6anebKmFwWreXQ+luUKna7gwoAwIqpmZt6QGzt96rZnaszJ8W4UFiGaWNY6/UvumArtSz6a+bFaI/cKDWr1826fZ85a3S9HR/G+lnHWTnYbomnMr9FK553WjACAIe52jNWsz5dcVL7sGrGaZmGY3iz11eFV+0R26qtFGylP4Zh0Vrfx6xnpS1SHaZwOhQAWOfJaPvGatP/Xqn/s9kVSJ+MXi9THTT4YHR9S9g/BgDsMzdFWxa8d9ixRDWr9ELmwmjPItuLWaY6cFAHIt4YdgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAy/AvyqO8QMK55DUAAAAASUVORK5CYII=>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAaCAYAAABozQZiAAAA30lEQVR4XmNgGAXtQDwLC14IxLZI6rACByAOAeIMIH4GxP+hfBCWRijDD3iA+AADRDNJgBGI5YD4OANEM8ggvACkIRSIDwGxDAOqzSA5PyD+CsTHoPIoABQYP4HYEspHdzbIgClQ/i6oGBzMgUqIQ/nomkEgCMr/jSQGBqCoAEmIQPnYNPtC+f+QxMAgAiqhCeVj01wO5V9BEoMDZiB+xQCRLAbiGwwQxROA+AsDxK9qcNVYAMgAkO3IicQTiPmRFREC2JxNNJAH4vMMEM0caHI4wQEGiAZsGBTao2AEAgC6WjujrQMhLgAAAABJRU5ErkJggg==>

[image14]: <data:image/png;base64,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>

[image15]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAZCAYAAAAFbs/PAAAAnElEQVR4XmNgGAWDEQgAsTAQM6JLoINgIP4PxM+A+BeUDdIIAiDNfVA2GGgD8SMg5obymYE4EIgjoHwVIN4OZYNBAxBXIgtAwSogZgHiOiDOQJbgB2JWZAEoOATElkC8A4jF0eSwgvlA/BqIddAlcIGFQLycAeIsogDIBpjHiQKXGIh0OwxsBWIOdEFcAKSwHF0QH5ABYht0wRELALaGEnjDW95QAAAAAElFTkSuQmCC>

[image16]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE8AAAAZCAYAAABw43NsAAAC4UlEQVR4Xu2XS6hNURzGP6GIKORGXgOPSFJX3SSSpCSUDIiilIwYGLgDM0mYSHELJcpMSl6RwQ0pRhIxYGBggCRiQHl8X/+1uuusu/c+6+5zuGT96uu0Hnuf9f/Wfz02kMlkMv8no6hD1KkCnQv6DSYjqPnU6LghkXFxhWM8LP6QodRkakhUX8gwajm1kdpF/aQuu7I0mCiQ3dR72ETq9zA1POxUgYzZQX2MGxz7qO/UA1iy3Ka+UT0wX5KR09Ng5h1A/VlOYUpcUUAH9Yy6Bss8z3HqQ1AuYyLMfJmumIqQedepkzDzpjY2N0eBnKY+UY9gf/SUek29QPosN0OT00Xdo2ZHbUWsg41FZoUo4DIzimhmnlQLBaQ0vQMzUdmmP9IL1aYA7ru2VlgPm5Bb1IKorYyD6BtLyFpXn8pvM28p9ZVa7MqheUIGqqyg6yxjZe0m6hI1J2prhg86Ds6blzqeFPM0tiPUVvQ/QErRi5URE1w5Nk+o/INaGdRVMYZ6Qx2FnWZ16UX/sYh2m6e9zm9Ns6i31EMkjF1ZoRNsriuXmfcEtgFXoT+TYTJOBraKTr54LKKd5sXonb2w/vKmEjmujt792LyZ1BdqjStX4a8E3XFDTf7Eso3R9eQirH98UBWyGZaqyq69sAcvUMeoz0g7GT3KuP1ofcmKsgNjg6vXfpxCmXmLqFfUeTROhO+v3yR0H9LS9ZdkHRCrqbFhpwGwB7Z8T1CTorZUtsDGciaql5lFZpRRZp5/zzv0JUi4bDV5A2I67EFdksOLaStoYh7DTtx5SM8Y9dM4tG10uboZ1EvqrCuLTlifOEOFTs4rsJjieLSH36VWBXXbYX17kPiFEbpdpHYgA1fAPoN0SU41UMHLKF3Yd8Iu7TfR+K2q1XGDWhLUiTgOL+2ZnoXUc+oqbN/Xp5q2nJFBn78GmaZLsu5TqegZLSstY/2mGp+KDspl1DbYJ2Emk8lkMpnMv8wvz4KxKm1EuiIAAAAASUVORK5CYII=>

[image17]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAaCAYAAABCfffNAAABDklEQVR4XmNgGAWDHYQA8VIgnoWGPYE4Aos4CFuDdZIAdBkQFj0D4gwgDgBiETS5/0D8EEmOLDAJiOcDMSOaOIgPswSkhmygCcRvgdgYXYIBIvaVASIPUkc2CGKAuFQQXQII0hkgcoeBmBdNjiQACgaQQdiCChSEFAcVyHUgV4IMWsmAmopAFryGyoF8SzaABdVpdAkG3EEF8qEbEBsgieEFsKACuRodYAsqkNh9qLgvkjhOAIpokA9AGqLR5EDgKgNmULExIFIcUZbAki5IA7bkiyvpkmTJWgaIS9cBMReaHD9Ubh4Qs6LJEWWJJRD/ZIAYgow5gNgFiP9hkQPFBSyJE2UJpWDUklEwCqgAANqWUOiDs13OAAAAAElFTkSuQmCC>

[image18]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAaCAYAAABCfffNAAABTklEQVR4Xu2VvUpDQRCFx0IQQcRgoWCwM6RIFRDE1sZONIVgK2gRsEwl+AgSrAwoFhYW6gtYqZ2VhQ9gI4iktLBRz3F2yWYckFyvYHE/+CC752Z/5g6JSMF/pwFP4aFxGa4783Tx65sDUJPeRk9wG67ASZN9wMcky0QbHsMhM89x3ITPZKYKu7BuA9G5V9Gcz2VmVfSkEzYAW6LZDRwz2UCwDFzIKxVL+OtS8XQ8JRc6k/4u4gYvIeNtMxNLdWcD8Us1DXdFD7ET5n4kloqntnil6sAynIPXcCbJXPiieQMutGEy8iDfS3UrehuyAFtJ5hJbly3qta/Xus+wEj5zs5MkczkXPekFHDXZeMiO4LDJCDtvH87aIMJrvokukjoCl+C7k/H9pC2+Bu+Tce7Mw0s4ZYO8YHkOYCmM93pRflzBTdFfZ/4VNPvjgoK/5hMxQVBu/9V0hgAAAABJRU5ErkJggg==>

[image19]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAaCAYAAABCfffNAAABWElEQVR4Xu2TMUsDQRCFJ5CAJgQJCCJY2QQLq9iEWNpYBEQshNiliP9AEPwTYpVCbUQiKNjbpUyVIj/ARhCxtLDRvOfueZvJoORyhWAefMXO29uZnZ0Tmemvaw9cgbZiG+wbcVL7+nICrUuc6Akcgh2wqLxP8Bh4iXQKLkBGxbmOknBPYq2BV1DRhrjYmzif+xJrV1ylJW1ALXFeFxSVN5HYBh5ktYotnLpVrI5V8qCOjE4RE7x4j7dNrKhVPW2I3aplcCKuiKaP/aqoVaxay2rVDVgF8+ASrASeKT40b8CDGsqjBjLeKq55Q6ru+VHR6HJErfG1RvdY4uqZrBp4pm7FVXYH8spb8N45yAVx7jsT9/ffB/ExMfu7uENC5sAW+DA8vo8e8QOwoWKpiy2+BlltTCMe9gzKfs0kD6DwvSMFsZ19iR9+ExzFdnriEPAdOLpLypvpv2sIYHFRud5wfF8AAAAASUVORK5CYII=>

[image20]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAbCAYAAACX6BTbAAABL0lEQVR4Xu2UvUoDQRSFr2ghaGMC9hEbC0md4AukSGUghU0eIKXgWxiIXTCINgZCijQBe0mjpU9gYSGkSSEoSHIOdwZvliU76xYi7Acfu/OzZ5i7syuS89fUYC9Qzk3FMWzAMVzAlmt7z+C7G7vQR9LTFQ3YiA6AQ/gG69GBEPbgk2h4HLtwAk+iAyFw6wzmAh4GDuER3IcDd02NL8mN6TuFj6K7+jW2JM+wD19cm4tmgtuewU94LnpCruC3aLkyYevtS1CED6ILk23Rd0AKrh3EtWg4r54DeC8/gbewA6fww/SvpQznTt7HsQXbps2FgsLjSmLhB9WEJdMXHD4SDecZ3nR9DGTNq/DOjduvNjG8Ino6+GCSnGdJDM/C/wu/hK/wS/QPyfe0szIjJycVSyqbSnUY8BgeAAAAAElFTkSuQmCC>

[image21]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAZCAYAAAB3oa15AAACfklEQVR4Xu2WTchNURSGX6EIIfJRRMpAFDL4Ij8TlAETBsrAkGRE+SmZGH4TKSk/yUhJYoCScsMEAyMpMSCSJFEMyM/7Wnvfvc+6p33vh7pfOW89nbPX2ue019pr/wCN/m9NJANkrHc4TfKGkaDD5Dm5TB46X66V5K43dtMcb3CaQhagnLlZZAWZQUY5n/SeLA7vq8kRMi25MYEcJB/J5sxelKZziHz1jqCZsIy9JVdhg9hDRuedqLXkETkVno+rbkwmt2CDlMaQ4+Q+eU1eBt6RY6hPQEUagLKqmmyRnxWvaRvMvj2zjSPXyKvQ1kAukDftHqaFwS6/tJycT+7fOuDaKptBZ+uqUgAa6DeyytmVudhfA9Ws+JqeDgtqfmjr6QPIE6NA96OHzHuVAnhBPsOyl0uZi/03hfdW22vSf2XfGNrjYRmOu4v8cT1IW2BlNmyVAtDgSwGonOJ7K++AFMDOzKZ/aaDKsrIdy2sebC38kf4mAH3bLQBf5167yFnY7ib2wUpSi7mncupnAMvIPTI3tI+Sp6GtcuppK+1nANokVFJRH1Dtfwm2dooqBfAvFrH8dVJ5nERaB5Lvf4PMztq1KgWgg+cHWefsZ5D6LyGf0HlwDcBqWdtsnXQS68TO5QO4gs7kdUj1ppNTH/trgqJ/Qu4gbXGDsFnRaRmlWv2OtOj0PETWt3skKeMnYLuQl5KV71rXydSsXVGc4jryLCwlz8gDshdWp+eQrgSSBrybnCZbw/NLsHup5lX7dXv+TXIRlkh9W1o/w5J+uAY2uNKlT4HvIBtQDTBKM3qbLPKOIPm1K+nAE3VB9lW6f3W756uP1oZfH40aNWo0QvQLRG+cfFbJXy4AAAAASUVORK5CYII=>

[image22]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAbCAYAAACX6BTbAAABWElEQVR4Xu2TvSuGURiHb6GEEoqZLAYZDCL/gGSiDBazySCy2i2UwUfKQslgUWS0MfoTpCiLMlDi+rnPyel15H3eV1neq66e5zkf93nOfe5jVuO/GcetMtXYQgzgNJ7gO86F7+gsPoS+ZZ9SnHXzAHWlHdCHdzhZ2lEO7XhlHjxHK57iWGlHOWjrCqwFIgp4hP3YhYfhWZiYkr2kbQovzXdVMWlKrnEXb8K3Fq0KbfsRX3DRvEI28M08XVWR5jumoBPPzBcWTdiGE7iJw5avqm/smAfXM9KLB+aHKvbND1fn0IGvuBD6fmQQn4J6z9GAq3iPa6FNl+kZh+KgHLmUpGjrM9iDzVgf2lVVt6H9R47Ng6uG40QFVM5HzdORu7XaxVKm/ZMR8+rQxN/UuBQd7Ip9/cyf0Wheptk/rhQFUxq2ze/BPJ5jdzqoUmJVpem6wJZ0UI0axfgAdcBScLigFh4AAAAASUVORK5CYII=>

[image23]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAZCAYAAABKM8wfAAACfElEQVR4Xu2WzatOURTGH6GI8pmPfCaUj1Jkptsd3MGVGKAI+QMMlZSpFCVRSuHWHeGSm8GVksFbSmJEvlJKIkkywYB8PI+19nn33fY573lTBjpP/Trttde7z9p7r7XOCzRq9M80PjVUaAKZjdG/kU1UaiqZ61RpMlmIfFBzyBVykZwn00dPF5pI9pJn5Cd5Q76QATKf3CKbC++MWuQJ7Ae3YS9MX6ZghsknmP8HsoOM8XkFcYos87GeR8g4H8d6Cgv0DFngtrFkF3noc6UBb4Q57IxsGv8gfT4+6bZDhQcwkzwmj3y8guxvT/+W/JdE41kw/8NobzSV7JUB96JzwC/ctrXwsNRowfwkpcgxstjHOmGN49Q5CFsn3kROn1ERsHa0xp9BWlTXpmKQtEC6axXFdbcHKW0uwVJq0MdB08h9mH+ngpJfacCpdG3fybbIVjfgoFxA69Bep5P2wVKsVCoY5bLS4hw5SiZF87kcXk0+ul3p0UnarHzrBNy1tKiuRS1GmkHukOdkESwvj5NX7ltHG8g31PfvSq9hC+tkQ24rHy/D+qX65xZywf3qaB55CfMv6xBBZ2E3nlXuY9GCLay2pfYVS6ernhm6RN2AFeRpmH8o5jKpaNenRmkKuUsewK49SB+POGDl8yayNPIJJ6ZuUleryHuyJ51INAKL7Q9p12riaxO7gn2LdqXqgyDbVViBKnDl8w2ULFwhvfMrLPB+2G0Fae0TyH/2C8lJeXkNFpj+C9wjyyMfFZpuQSev/JK//ivEnaQbrSQ3YYegTqM1h8g7ciDyK5XSQW1nN6y15YpCu+6B+YTv/99KddBLtvsz178bNWrU6H/VLxb1hWtyal9pAAAAAElFTkSuQmCC>

[image24]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAZCAYAAABdEVzWAAACj0lEQVR4Xu2WzctNURTGH6HI90dJSGTiI0KMxISBAfkaYe4PUMTIxIBiREoMKAmRATI8ZaIoUVKiXgYkoRQThef3rrPv3Xffe+77Toi6v3rqnrX32Xvttdda50oD/h2mW2NLY8GE0vAnGW+ds55a162ZncMtpll3S2MTnHKNNa8cqJljjSlsbDA1ez5oPVfMPWK9snYoHAbeX2k9URxgRDjdF+uS4qVNncPDvLE+WNes89aQ9dlaXY/PVjjFGrDYqqwzCgffWu+tZ9YLa349r5Fj1tHC9sm6ao3LbI8Um+DUSbWjkFhrfbMO18+Trdu1PUFEz6pz3Z7MUGy4r7ATnSF1Xmtlzc2eS1ZZX9U+5BTFTRA5ILIPNIpIARvhxLbCju2ntTmzVervGPn20LqiyKUV1k1F5OCOtb3+PSL9HPtl7cpsleL0exXXuUzdxcDYR2u9Ys7+bGxUV5hDTpQ5RrRwLOULPFZsmDihmJNv3ouyNaxTtBOKbVJm74IXX1oLs2eqj00PpEk9IMrM4fp4pxdE9JAiWrBcUZ27FQ34dD2nESrwu+IlSv61YtOt+aSCDdYPRQUvLcYSRDglPA5Q1RQbRQf3rUX170b4RMxSLECO5RvSGt5ZW+pnSO0B5S0hka4wJXzqAJXaBXFBnQXWwURrSWEjenkfo0iI4KnWjPZV0jRTS8hJV5ivwYErtR07ru7Ca0HlUdY4CISfRcu7x9E8WTk9CZw6fw7RyqML3AgR5GrpcXBDzWkwvAiTKW8mEq2yqwNVSO5dVHx2+MxQYSUp4cuDAddKStDj4LJ679Vio6L771TkWRMLrD2KuU0LEsF7pbGGSsRpDnhL7U7wV8Dhvv1JkWP8AxkwYMB/wW9yiXz19WYSFwAAAABJRU5ErkJggg==>

[image25]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAWCAYAAABdTLWOAAAAjklEQVR4XmNgGAWjYGgAWXSBwQTEgbgbiH+hSwwGwAzEAkDMA8QHgPg/iuwgA6OOpBYgx5EzGCDqPdAlaAXIcaQBEJ8GYn50CVoBchxJdzDqSGoBchypBsT7gZgVXYJWQB6IzzNAHEmspXMYIOod0MSpDkAhCLIIG/ZFUocNuALxRyCWRJcYBaNgFAwgAAB/vyEyUzo1NwAAAABJRU5ErkJggg==>

[image26]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAXCAYAAACmnHcKAAABiElEQVR4Xu2WvytGYRTHvwOlkMWGyCaLMvoxWQ1EKX+AzWBRZgYlg0w2k8FgkkV5S1ksEmXEYqIMJoXvt3Ofes5963278V53eD71We65vZ3znHOe+wKJROI3TNND+kBv6JwP17FFnzP1/pCL/jODdIHu0m9YYY14g713RZdouw9XA534Bz2nnblYoJ9ewIpZzsUqg5Ks0Xv6Qodd1Jiim/STXtJuH64OM/QIVpC6M+6iQA89gBWtruz5cLXYoOuwfVGysz6MVbpI22DxeR9uSBe9pWP5QCvooMd0ErY3SnYtio/Sfdii99FXOhLFm6Eu6zd1WC0n7IsSXUH9GKkQFSRUcNF9UWeuUVJnwogJnaJ2pgZLQoVqX4Q6eIpiI1Yq8YgJ3WK6zZ7oAN3Jngt17hHFRqxU4hETvbDrWXuhvdnOngvdeF8oNmKlogRPYB0S+ljqo6m9uYMVG9Ao6nlRdHGcwf/Wn6JR0ekruWBYeiWtb0r4mxK/E4xvu2Zo597pRD6QSCQSicAPGb5NLvA3UqcAAAAASUVORK5CYII=>

[image27]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAWCAYAAAC7ZX7KAAAAjklEQVR4XmNgGAWjYHgCWXSBwQrEgbgbiH+hSww2wAzEAkDMA8QHgPg/iuwgBqMOpjUgx8EzGCDqPdAl6AHIcbABEJ8GYn50CXoAchw8oGDUwbQG5DhYDYj3AzErugQ9gDwQn2eAOJhYB8xhgKh3QBOnKQCFLMhSbNgXSR024ArEH4FYEl1iFIyCUTAMAAB6hyEyC+Ve7gAAAABJRU5ErkJggg==>

[image28]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAWCAYAAABOm/V6AAAAg0lEQVR4XmNgGAWjgDBgBGIVdEF6AZDlWkC8EYgfoErRB+gC8V8g/gbE/4H4Iao0fYExEH9lGHUEeY5wBeJHQNyOLkEuIMcRCxmonI7IcQTVwagjYGDAHQEqMT2A+DcQv4LyiQFUS5iSDBCD0PEBIOZBKMMKgoD4BxDPR5cYBaNgSAMAqNYm0vwoOmEAAAAASUVORK5CYII=>