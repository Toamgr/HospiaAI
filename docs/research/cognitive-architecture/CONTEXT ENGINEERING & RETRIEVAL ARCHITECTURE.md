Research archive note: This document is supporting research for HESTIA Cognitive Architecture. It is not canonical product doctrine, current production behavior, or implementation authority. Do not implement it directly without HESTIA's provenance, confidence, role-access, venue-boundary, evidence, and human-approval guardrails. It must not be used to create fake intelligence, fake Venue Memory, fake Venue DNA, fake KPIs, or automatic operational truth.

# **Cognitive Architectures for Dynamic Context Optimization in Long-Term Operational AI Systems**

## **Context as an Intelligence Problem**

In long-term operational environments, context is not merely a static corpus of text injected into a model's prompt to guide a single inference cycle.1 It is a high-dimensional, time-varying state space that represents the active working environment of an intelligent system.3 Drawing from cognitive science, context serves as the active working memory (![][image1]) that interfaces between the agent's decision-making loop and its vast repositories of long-term memory (![][image2]).3 Treating context as an intelligence problem requires moving past the lookup-centric paradigms of early retrieval-augmented generation (RAG) and defining context as the dynamic, structured representation of everything the system must "know" right now to execute a specific task with high fidelity, strict transactional alignment, and compliance.2  
What makes context relevant is its causal utility to the active task.8 Relevance is not defined solely by vector similarity to a user query, a fallacy known as the "Search Assumption".9 True relevance is a multi-dimensional function of:

* **Semantic Alignment**: The overlapping conceptual meaning between retrieved nodes and the active operational domain.1  
* **Temporal Recency**: The chronological proximity of a historical interaction, preference, or state update.1  
* **Structural Salience**: The topological position of a piece of knowledge within a broader causal graph or hierarchy of constraints.9  
* **Procedural Necessity**: The explicit mapping of retrieved rules, workflows, or tool schemas to the current execution node in the system's plan.3

Conversely, context becomes distracting when it introduces high-density noise, un-deduplicated redundant entries, obsolete state representations, or resolved historical failures.12 When an agent explores a complex codebase or execution path, it inevitably encounters dead ends.16 If the raw logs of these exploratory failures remain in the active context, they act as distractors, confusing the model's attention heads and causing it to recreate past mistakes.15 This distraction manifests as "context poisoning," where the retrieval of semantically similar but logically outdated or incorrect facts pollutes the working memory.15  
AI systems suffer from severe, asymmetrical degradation under both context-rich and context-poor extremes.  
When systems retrieve too much context, they experience Context Bloat.16 As the context window expands, the computational cost grows linearly, processing latency spikes due to GPU queue pressures, and the model's reasoning capabilities degrade.1 This is driven by attention dilution and the "lost in the middle" phenomenon: models favor information at the beginning and end of their context windows while dropping critical constraints in the middle.20 Excessive context introduces conflicting assertions, outdated guidelines, and irrelevant environmental variables, causing the model to wander down inefficient, non-terminating reasoning paths.15  
When systems retrieve too little context, they suffer from Contextual Tunneling and Contextual Isolation.9 Operating without sufficient historical, environmental, or organizational constraints, the agent is forced to make decisions in a vacuum.6 It becomes unable to resolve multi-hop relational dependencies, loses track of long-horizon temporal changes, and fails to maintain transactional integrity.6 The system behaves in a brittle, stateless manner, repeatedly violating implicit user preferences, organizational boundaries, and strict regulatory policies.1  
To operate reliably, an advanced AI system must systematically isolate and distinguish among nine core contextual dimensions.

### **Functional Matrix of the Nine Contextual Dimensions**

| Dimension | Scope & Functional Role | Primary Storage Mechanism | Update Frequency |
| :---- | :---- | :---- | :---- |
| **Immediate Conversation** | The active, turn-by-turn dialogue history and user-agent exchange.3 | High-speed key-value session cache.21 | Per-turn (sub-second).8 |
| **Long-Term Memory** | Consolidated historical facts, user-specific preferences, and persistent constraints.1 | Epistemic document stores & user profile databases.1 | Event-driven (post-session synthesis).12 |
| **User Profile** | Rigid user identity variables, language/style preferences, and explicit budget/access parameters.1 | Relational database (SQL) with strict schema validation.5 | Infrequent (on profile edit or deep preference consolidation).1 |
| **Organizational Memory** | Centralized business glossaries, metadata definitions, system lineages, and entity identities.3 | Governed corporate semantic models and enterprise knowledge graphs.2 | Scheduled offline batches / schema evolutionary updates.21 |
| **Task Context** | Active plan execution graph, sub-task decompositions, dependency mappings, and intermediate state traces.5 | Directed Conditional Graphs (DCG) and runtime state machines.5 | High-frequency continuous updates (per execution step).6 |
| **Rules & Policies** | Immutable regulatory frameworks, safety guardrails, and compliance definitions.3 | Immutable policy-as-code files and version-controlled policy vaults.3 | Low frequency (compliance-driven manual deployments). |
| **Historical Precedent** | Executed task trajectories, multi-agent operational records, and case-based success/failure states.5 | Relational SQL episodic databases and read-only event logs.5 | Task completion events (post-mortem evaluation loops).12 |
| **Current Operational State** | Dynamic infrastructure logs, system resource metrics, active connections, and execution bounds.4 | Ephemeral time-series caches and orchestration registries.6 | Continuous real-time streaming (sub-second intervals). |
| **External Environment** | API endpoints, Model Context Protocol (MCP) servers, third-party files, and live remote database configurations.20 | Dynamic MCP middleware registries and API gateways.20 | Dynamic on-demand tool execution loops.24 |

## **Context Retrieval Architectures**

To navigate this multi-dimensional space, the system must deploy specialized retrieval modalities. Rather than relying on a single vector search, an operational cognitive architecture uses a diverse suite of retrieval engines, each optimized for specific data structures and compliance constraints.

### **Comparative Evaluation of Context Retrieval Architectures**

| Retrieval Modality | Strengths | Weaknesses | Primary Failure Modes | Best Use Cases | Long-Term Maintainability |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Keyword Search** | Deterministic; highly effective for exact codes, unique IDs, names, or strict taxonomic terms. | Incapable of semantic expansion; highly vulnerable to vocabulary mismatch and spelling variations. | Zero-recall failure on queries with synonymous terms; missing essential files due to terminology gaps. | Looking up system error codes, direct database keys, schema variables, or specific SKU identifiers. | High; indexing is computationally lightweight, simple to index, and standardized. |
| **Vector Search** | Captures latent semantic relationships; aligns conceptual queries across varying terminologies.1 | Lacks structural or topological awareness; suffers from "hub explosion" in high-density spaces.10 | Surfacing semantically similar but logically contradictory or outdated facts, leading to context poisoning.15 | General semantic exploratory searches across vast, unstructured, multi-format documentation.12 | Moderate; embeddings require full re-indexing whenever the underlying embedding model is upgraded. |
| **Hybrid Search** | Combines lexical precision with semantic range; balances keyword matching and latent vectors. | Requires continuous tuning of reciprocal rank fusion (RRF) parameters or weighting parameters. | Out-of-order scoring where irrelevant semantic matches push down critical exact keyword matches. | Multi-format enterprise search engines handling ambiguous human user queries. | Moderate; demands maintaining and validating dual indexing pipelines concurrently. |
| **Graph Retrieval** | Maps explicit entities, multi-hop dependencies, and semantic lineages across complex nodes.9 | High execution latency; exponential traversal complexity due to the "fan effect" in dense nodes.9 | Traversal path divergence; execution timeouts when navigating heavily connected "hub nodes".10 | Multi-hop reasoning, dependency tracing, root-cause analysis, and relational compliance audits.9 | Low to Moderate; requires continuous graph schema governance and link consistency validation.7 |
| **Episodic Memory Retrieval** | Recalls distinct historical event trajectories, user choices, and temporal execution states.1 | Highly unstructured; prone to polluting working memory with redundant, outdated failure traces.12 | Context poisoning via old, un-pruned episodic records of failed tasks.14 | Personalizing interface experiences based on specific past user behaviors and past task outcomes.1 | Low; requires constant background vacuuming, de-duplication, clustering, and decay pruning.12 |
| **Semantic Memory Retrieval** | Surfaced facts represent generalized world concepts, business definitions, and dictionary terms.1 | Fails to capture the raw temporal sequence of events or user-specific conversational nuances.3 | Retrieval of technically accurate static concepts that violate active, real-time operational rules.19 | Resolving domain-specific terminology, validating data glossary terms, and grounding core ontologies.2 | High; highly structured, centralized corporate vocabularies are easily governed. |
| **Rule Retrieval** | Absolute, deterministic execution; guarantees that strict programmatic boundaries are never bypassed.3 | Zero adaptability; cannot handle ambiguous, edge-case, or open-ended natural language inputs. | Rule collision; conflicting rules block the system completely without a clear fallback resolution path.6 | Validating API arguments, verifying database schemas, and checking execution safety bounds.6 | High; rules are maintained directly as version-controlled code. |
| **Policy Retrieval** | Governs role accessibility, privacy zones, compliance boundaries, and authorization checks.3 | Can add latency overhead if every memory read requires a dynamic, multi-layered permission check.19 | Privilege leakage due to failures in resolving nested or inherited group policies.23 | Restricting agent memory visibility based on active role-based access control (RBAC) maps.2 | High; aligns with standard, centralized corporate identity and access management (IAM) systems. |
| **Case-Based Reasoning** | Leverages explicit historical resolution trajectories to guide active debugging or planning.5 | Requires an extensive, highly curated, and manually verified database of historical scenarios. | Over-generalization; attempting to apply a historical resolution to an event with subtle but critical state differences.5 | Automated customer service escalation, network incident response, and legal or medical validation.5 | Moderate; requires continuous post-mortem annotation and outcome-success auditing. |
| **Hierarchical Retrieval** | Progressively loads nested contexts based on directory structures or tree schemas.1 | Highly rigid; brittle to unstructured datasets that do not map neatly to folder directories. | Directory traversal lockouts if parent directory structures are dynamically changed.13 | Navigating enterprise code repositories, structural project boards, or tree-structured wikis.13 | High; directory structures provide intuitive, easily governed file mapping.21 |
| **Multi-Stage Retrieval** | Minimizes token costs by using lightweight retrievers early and precise re-ranking models late.27 | Pipelined latency overhead; introduces multi-step sequential dependencies into the runtime. | Candidate truncation; discarding a critical tail document during early-stage filtering steps.27 | Processing massive document lakes under strict budget constraints. | Moderate; requires calibrating both the candidate retrievers and the deep re-ranking models.28 |
| **Agentic Retrieval** | Treats retrieval as an iterative reasoning loop; lets the agent plan, browse, inspect, and verify.7 | Extreme token cost; highly variable latency; risks entering non-terminating execution loops.7 | Loop recursion; agent continuously refines search queries on ambiguous tasks without terminating.7 | Complex multi-document analysis, scientific claim verification, and deep investigatory research.26 | Low; demands constant guardrail monitoring, prompt refinement, and Error Book validation.7 |

## **Context Prioritization**

When multiple retrieval engines return candidate context blocks, the system must prioritize and filter this raw stream before injecting it into the working memory.15 Cosine similarity in a vector space is a poor proxy for operational utility.9 Instead, the system must deploy a multi-factor valuation matrix to score and filter candidate nodes dynamically.

### **Relevance and Contextual Influence Value**

While semantic similarity establishes an initial candidate pool, the system must calculate the Contextual Influence (CI) Value of each node.27 The CI Value treats context quality as an inference-time data valuation problem.27 Rather than scoring each document in isolation, the CI metric quantifies how much the generator model's output quality would degrade if a specific context block ![][image3] were removed from the retrieved set ![][image4] 27:  
![][image5]  
where ![][image6] is the generator model, ![][image7] is the query, and ![][image8] is a structural utility function measuring properties like sequence probability, constraint adherence, or citation alignment.27 Because evaluating this equation at runtime for every candidate is computationally prohibitive, the architecture deploys a parameterized hierarchical surrogate model.27 This model evaluates local query-context relevance alongside global inter-context interactions to predict and retain only those nodes with positive CI values, filtering out redundant, distracting, or low-value information.27

### **Freshness and Temporal Decay Kinetics**

In operational tasks, the relevance of episodic memory decays over time.9 To prevent obsolete historical patterns from overriding current realities, the system applies an exponential decay function, adjusted by the frequency of node interaction.9 Let ![][image9] represent the active salience of memory node ![][image10] at time step ![][image11]:  
![][image12]  
where ![][image13] represents the decay constant and ![][image14] is the timestamp of the last retrieval, validation, or reinforcement event.9 As an episodic memory fades, it is either decayed to cold archive storage or consolidated into a generalized semantic node, shifting its decay properties.1 Crucially, when a procedural workflow matures, the system actively suppresses old failure episodes from surfacing, preventing historical noise from corrupting active operations.14

### **Confidence and Uncertainty Decomposition**

Prioritization must adapt to the system's own state of knowing. The architecture deploys a Bayesian Retrieval-Augmented Generation (BRAG) framework to decompose uncertainty into epistemic uncertainty (lack of system knowledge due to missing evidence) and aleatoric uncertainty (inherent ambiguity in the query).31 The system calculates an answerability probability ![][image15]:  
![][image16]  
If ![][image15] falls below a minimum threshold ![][image17], the system bypasses the generator entirely to route the task to an escalation or abstention loop, preventing the model from generating hallucinated responses using weak context.9

### **Source Reliability and Provenance**

The lineage of each context block is checked at retrieval time.20 Every node is tagged with a metadata lineage trail, indicating its origin, verification status, and quality certification level.20 During prioritization, certified data assets are weighted higher than uncertified, un-audited, or user-generated logs.19

### **Role Permissions and Security Vaulting**

Role-Based Access Control (RBAC) operates as a hard constraint before prioritization begins.2 Context is divided into isolated vaults, and the system restricts search queries based on the intersection of the active user's permissions and the agent's execution scope.23 Chunks lacking verifiable matching credentials are filtered out at the search index level.23

### **Risk Level and Decision Importance**

High-stakes decisions (such as executing financial transactions or updating system files) trigger strict contextual criteria.5 For high-risk tasks, the system prioritizes rule and policy contexts over fuzzy episodic or semantic memories, mandating precise constraint validation before execution.6

### **User Intent and Current Task Graphs**

The prioritization model tracks the active node in the system's Task Execution Graph.5 Context chunks that map directly to the current sub-task's input dependencies are weighted higher than general historical dialogue, aligning the context window with the active plan.6

### **Contradiction Potential and Error Book Auditing**

The system cross-references retrieved candidates to detect potential contradictions.7 If two retrieved chunks present conflicting guidelines (such as divergent API schemas), the system flags the contradiction, queries its historical Error Book to resolve the discrepancy, and, if unresolved, routes the collision to a human arbiter.6

## **Context Compression**

As interaction history and environmental trajectories expand over long-horizon tasks, they quickly exceed token limits and cause context bloat.8 Rather than using simple truncation, an operational system must employ a structured context compression pipeline to distill massive, noisy streams into compact, actionable states.8

### **The Three-Dimensional Taxonomy of Context Compression**

As established in recent systems research, compression must be evaluated along three distinct axes 8:

1. **Compression Target (What is compressed)**:  
   * *Observations*: Reductive filtering of long tool outputs, system shell returns, or database logs while preserving strict syntactical outputs.8  
   * *Trajectories*: Condensing the historical sequence of Actions, Thoughts, and Observations (A-T-O sequences) to maintain long-horizon planning continuity.8  
   * *Plans and Reasoning*: Abstracting intermediate reasoning paths, self-correction traces, and exploration steps into high-level strategic states.8  
   * *Memory States*: Distilling raw, scattered episodic logs into consolidated, generalized semantic concepts.1  
   * *Representation-Level*: Intervening at the neural level, compressing tokens into compact latent vectors or KV-cache representations.8  
2. **Compression Mechanism (How it is transformed)**:  
   * *Masking and Truncation*: Selective dropping of non-essential prompt spans or trailing text blocks.8  
   * *Summarization and Abstraction*: Generating recursive, query-focused textual summaries of historical interactions or task phases.8  
   * *Pruning and Reduction*: Selective token-level or sentence-level filtering using small, high-speed classifiers (e.g., LLMLingua-2) or model attention head allocations (e.g., EHPC).8  
   * *Externalization and Retrieval*: Archiving raw, detailed logs in cheap, external cold storage, replacing them in active memory with brief index pointers.8  
3. **Control Policy (Who decides when and how compression is triggered)**:  
   * *Passive/System-Driven*: Automatic background triggers executed on token threshold violations, cache misses, or scheduled batch windows.8  
   * *Active/Agent-Centric*: The agent autonomously monitors its own context window and decides when to consolidate key learnings into persistent "Knowledge" blocks and prune its raw trajectory logs.16

### **Biological Exploration and the Focus Architecture**

A prominent model for active, agent-centric context compression is the **Focus** architecture, inspired by the biological exploration patterns of the slime mold *Physarum polycephalum*.16 The slime mold explores complex physical networks, physically retracting from dead ends while leaving chemical markers behind to prevent re-exploration.16  
Similarly, the Focus Agent is scaffolded with explicit tools to manage its context.16 During software engineering or deep research tasks, the agent declares its target exploration space (start_focus), executes complex tool exploration steps (accumulating raw, noisy logs), and, upon hitting a dead end or completing a milestone, invokes a consolidation tool (complete_focus).16 This tool prompts the model to extract key lessons, verified paths, and facts, writing them to a persistent "Knowledge" block while physically pruning the raw, noisy interaction history from the active context window.16  
This active self-regulation avoids context bloat, reduces token consumption, and prevents distraction by eliminating previous errors from the reasoning loop.16

### **Pathological Compression Failures and Mitigations**

The compression of high-dimensional context introduces structural vulnerabilities. The table below analyzes five core failure modes of context compression and details their architectural mitigations.

| Failure Mode | Target & Mechanism | Symptom | Mitigating Architectural Pattern |
| :---- | :---- | :---- | :---- |
| **Pre-Compression Decision Error (F1)** | Plans & Summarization.8 | Discarding critical details too early, before their downstream dependencies are known.8 | **Multi-Step Dependency Triage**: Evaluating candidate context elements against future task dependencies before trigger execution.8 |
| **In-Compression Information Loss (F2)** | Observations & Pruning.8 | Mutilation of syntactically rigid elements like JSON structures, bash code, or file paths.8 | **Type-Aware Compression**: Applying lossy summarization strictly to natural language, while using exact token masks for code spans.8 |
| **Post-Compression Access Failure (F3)** | Trajectories & Externalization.8 | The agent requires a fine-grained historical detail that has been compressed, but the retrieval hook fails.8 | **Bi-Directional Schema Linking**: Appending exact, cryptographic index keys to compressed summaries that point back to raw cold-storage records.12 |
| **Uncertainty Flattening** | Memories & Abstraction. | Deleting nuance and qualifiers, converting speculative hypotheses or opinions into rigid facts.31 | **Confidence Score Preservation**: Mandating that all compression summaries explicitly carry forward probability scores and uncertainty flags.31 |
| **Contradiction Camouflage** | Trajectories & Abstraction. | Merging divergent customer statements or conflicting API schemas into a single summary, masking a critical dispute.7 | **Saga Conflict Isolation**: Routing summaries through a validation agent to isolate, flag, and write contradictions to an active Error Book.6 |

## **Context Governance**

To operate safely in highly regulated enterprise environments, context retrieval must be bound by a zero-trust metadata perimeter.19 Traditional data security limits access to database tables; context governance asserts that *the metadata layer is the new security perimeter*.19

### **Zero-Trust Metadata and Context Poisoning Defense**

By adopting zero-trust principles, the context engine treats every retrieved chunk as inherently untrusted.19 Before a candidate context block is allowed to cross the boundary into the agent's working memory, its freshness, provenance, and semantic integrity must be verified.19  
The system implements a **metadata firebreak**.19 When a document is modified in the source system, its cryptographic hash (e.g., SHA-256) is updated in a centralized registry.19 When the retrieval engine fetches a vector chunk, it compares the chunk's metadata hash with the registry.19 If the checksums do not match, the system flags the retrieval as stale, blocks the chunk, and triggers an immediate re-indexing routine, preventing context poisoning from spreading down the execution pipeline.19

### **RBAC, Privacy, and Human Dignity**

Context permissions are enforced via granular Role-Based Access Control (RBAC).2 Contextual assets are isolated within encrypted vaults.23 Within these vaults, permissions are mapped by user identity, team clearance, and agent zone; no permissions are inherited by default.23 To preserve privacy, data sensitivity, and human dignity, the system runs query-aware PII/PHI masking on all outgoing context streams.23  
If an agent lacks clearance to view a patient's medical records or a client's financial details, but must verify a transaction, the governance layer executes **Privilege Escalation-by-Abstraction**. This summarizes the sensitive records into a high-level, compliant verification digest, letting the agent validate the plan's dependency without exposing sensitive information.

### **The Saga Pattern for Context Governance**

To maintain continuous compliance, the system implements a **Saga Orchestrator** to track context utilization.6 The orchestrator logs every retrieval event, mapping which agent decision used which specific context chunk version, and commits this dependency trail to an immutable, SHA-256 hash-chained transaction ledger.19  
If a source document is subsequently invalidated, updated, or deleted, the Saga Orchestrator executes a compensation workflow.6 It traces the invalidated context down the dependency graph, identifies all downstream decisions or actions influenced by that stale chunk, and automatically triggers an evaluation, human review, or rollback of the affected steps.6

## **Context-to-Reasoning Integration**

Context has a single purpose: to steer execution.2 Within an operational system, retrieved context influences the agent's behavior across eight distinct downstream operational pathways.

### **Downstream Operational Pathways**

1. **Conversation Steering**: Dynamically updating the active system instructions to reflect consolidated user preferences and conversational styles, eliminating repetitive introductory turns.1  
2. **Recommendation Generation**: Loading historical execution cases and user preference parameters to tailor operational recommendations.5  
3. **Memory Updating**: Guiding how the system extracts, clusters, de-duplicates, and writes new interaction logs back to the long-term episodic and semantic databases.1  
4. **Decision Support**: Evaluating retrieved evidence, rules, and policies to verify that a proposed plan or action is grounded, safe, and authorized.6  
5. **Task Execution**: Directing tool-calling parameters, file paths, and environment inputs to ensure syntactical and logical correctness.6  
6. **Proactive Alerting**: Synthesizing environmental telemetry and structural knowledge graph paths to detect potential schedule conflicts or operational risks before they are explicitly queried.9  
7. **Simulation and Path Traversal**: Spinning up parallel virtual environments to evaluate proposed execution paths against retrieved precedents and policy constraints.4  
8. **Escalation and Handoff**: Automatically formatting comprehensive execution state logs, evidence gaps, and failure traces to facilitate a clean handoff to a human operator.6

### **Mitigating In-Context Bias and Relational Tunneling**

A major risk in long-term systems is historical bias: the system continues to favor outdated or failed behaviors simply because they are highly embedded in its episodic history.14 To maintain cognitive agility, systems implement two primary mitigation mechanics.

#### **Active Episodic-to-Procedural Transition**

The system must actively suppress old failure episodes from surfacing once a successful procedure has been validated.14 When a procedural workflow reaches high reliability, the underlying raw failure episodes are moved to cold archive storage, preventing them from competing with active operational guidelines.12

#### **Spreading Activation with Lateral Inhibition**

The system models memory as a dynamic graph where nodes represent episodic events and semantic concepts.9 During retrieval, input signals inject activation energy into the graph.9 To prevent the "fan-out" effect from flooding the system with irrelevant, loosely connected historical memories, a biological mechanism of *lateral inhibition* is implemented.9 As a particular sub-graph gains activation energy, it transmits inhibitory signals to adjacent, non-essential nodes, suppressing competing distractors and keeping the agent's working context mathematically focused on the active task.9  
Let the activation dynamics be defined as follows. At time step ![][image18], the activation energy ![][image19] of node ![][image10] is calculated by:  
![][image20]  
where ![][image21] is the temporal decay rate, ![][image22] represents the weight of the incoming edge from node ![][image23] (attenuated by the fan-out effect to prevent hub explosion), ![][image24] is the lateral inhibition signal from competing subgraphs, and ![][image25] is the sigmoid squashing function:  
![][image26]  
Nodes with an activation energy exceeding a set threshold are selected for injection into the context.9

## **Context Engineering Framework**

### **Purpose**

To establish a structured, governed, and certified delivery pipeline that transforms raw, unstructured enterprise datasets into context representations ready for ingestion by autonomous agents.2

\+-------------------------------------------------------------+  
|                      Raw Enterprise Data                    |  
\+-------------------------------------------------------------+  
                               |  
                               v  
\+-------------------------------------------------------------+  
|             Centralized Business Glossary (AtScale)          |  
|                 \- Metadata Lineage Certification            |  
\+-------------------------------------------------------------+  
                               |  
                               v  
\+-------------------------------------------------------------+  
|                Semantic Validator (SagaLLM)                 |  
|             \- Query-Aware Token Masking & Redaction         |  
\+-------------------------------------------------------------+  
                               |  
                               v  
\+-------------------------------------------------------------+  
|               Certified Context Vector Chunk                |  
|                    (Loaded to Context Vault)                |  
\+-------------------------------------------------------------+

### **Inputs**

* Raw corporate files, relational schemas, and real-time operational database logs.7  
* Centralized enterprise business glossaries, terminology definitions, and data governance schemas.3  
* User identity tokens and security access policies.23

### **Outputs**

* Clean, structured, and certified context chunks wrapped in cryptographic provenance envelopes containing metadata checksums, origin lineage parameters, and access control lists (ACLs).2

### **Risks**

* **Glossary Desynchronization**: Enterprise definitions mutate (e.g., "fiscal year"), but the vector index continues to retrieve outdated semantic interpretations, leading to reasoning drift.20  
* **Ingestion Pipeline Contamination**: Malicious or unverified files enter the system, leading to widespread context poisoning across downstream agents.19

### **Failure Modes**

* **Factual Ambiguity**: The retrieval engine retrieves multiple, conflicting definitions of a core KPI, causing the planning model to generate contradictory execution routes.2  
* **Lineage Disconnection**: The system retrieves a chunk lacking metadata lineage parameters, bypassing compliance validations and triggering system lockouts.19

### **Human Approval Requirements**

* Explicit digital sign-off and version control by data stewards are required before any new dictionary, business glossary, or organizational compliance policy is committed to the production memory vaults.23

### **Recommended Implementation Patterns**

* Deploy **AtScale-style** semantic metadata virtualization layers.2 Ensure all database schemas are mapped through a centralized business glossary before indexing.2 Run continuous, automated metadata audits to certify file freshness.20

## **Context Taxonomy Framework**

### **Purpose**

To organize, separate, and isolate the system's memory into distinct cognitive buckets, avoiding prompt contamination and context bloat while supporting multi-hop reasoning.3

### **Inputs**

* Active dialogue session turn data.12  
* Task state metrics and tool observation sequences.6  
* Corporate governance documents, user profiles, and compliance rules.3

### **Outputs**

* An isolated multi-database memory topology mapping incoming context types to specific, specialized physical storage engines.3

### **Risks**

* **Contextual Overlap**: Episodic dialogue transcripts duplicate data stored in semantic database repositories, causing double-retrievals and context bloat.12  
* **Procedural Leakage**: Hardcoding operational parameters or routing rules within the prompt space rather than maintaining them in a governed, central database.3

### **Failure Modes**

* **Memory Pollution**: Ephemeral chat pleasantries are stored inside the long-term semantic profile database, increasing search latency and token consumption.12  
* **Precedent Decay**: Deleting historical episodic failure traces too aggressively, making the agent unable to learn from past planning mistakes.14

### **Human Approval Requirements**

* Policy-level transitions that escalate local, episodic task trajectories into global, company-wide procedural guidelines require review and validation by system administrators.13

### **Recommended Implementation Patterns**

* Implement the **Princeton CoALA framework**.1 Map working memory directly to the in-memory context window.3 Route episodic traces to an indexed document store 1, semantic knowledge to a graph database 1, and procedural rules directly to version-controlled codebase modules.3

## **Retrieval Architecture Framework**

### **Purpose**

To transition from a flat, one-shot lookup paradigm to an active, agent-controlled **Retrieval-as-Reasoning** workflow.7

### **Inputs**

* Natural language user query ![][image7].7  
* Active Task Execution Graph and plan dependencies.6  
* Interlinked, path-indexed hierarchical knowledge databases.21

### **Outputs**

* An iteratively compiled set of verified facts, documents, and path-linked pages supporting the execution loop.7

### **Risks**

* **Recursive Latency Spikes**: The agentic traversal loop takes too long to navigate nested pages, exceeding system latency SLAs.7  
* **Dangling Link Failures**: Navigating a compiled wikilink that points to a non-existent index target, breaking the traversal path.7

### **Failure Modes**

* **One-Shot Retrieval Failure**: Embedding models fail to resolve a complex, multi-hop question because the starting query lacks direct semantic overlap with the target document.7  
* **Infinite Self-Correction Loops**: The agentic search loop gets trapped in a cycle of query refinement on highly ambiguous tasks.26

### **Human Approval Requirements**

* If the agentic search loop exceeds five traversal hops without locating verified evidence, the retrieval must escalate to a human analyst.7

### **Recommended Implementation Patterns**

* Deploy **LLM-Wiki** and **WikiKV** architectures.7 Compile corporate corpora into structured, interlinked markdown pages with explicit bidirectional wikilinks.7 Expose fast path lookup and budgeted navigation tools directly to the agent.21

## **Context Prioritization Framework**

### **Purpose**

To dynamically rank, sort, and filter candidate context blocks, ensuring only highly critical, fresh, and authorized context reaches the active working memory.15

### **Inputs**

* Raw candidate context array ![][image4].27  
* Active query ![][image7], user profile metrics, and task graph states.6  
* Cryptographic metadata labels (provenance, access lists, timestamps).19

### **Outputs**

* A prioritized, sorted, and size-optimized context list matching the available token budget.15

### **Risks**

* **Contextual Influence Miscalculation**: The prioritized surrogate model misjudges a node's logical influence, pruning a crucial constraint.27  
* **Stale Bias**: Surfacing older, highly connected nodes that have not been decayed, blocking new, correct updates.12

### **Failure Modes**

* **Distractor Penetration**: The prioritization model lets a highly similar but logically distracting document bypass its filters, leading to reasoning confusion.15  
* **Epistemic Overconfidence**: Injecting highly uncertain, low-confidence context into high-risk planning steps instead of triggering an escalation path.31

### **Human Approval Requirements**

* Risk-tolerance boundaries and low-confidence thresholds (![][image17]) governing Bayesian answerability must be approved by risk officers.31

### **Recommended Implementation Patterns**

* Deploy a **Contextual Influence Value (CI Value)** predictive model.27 Filter out any candidate node with a non-positive predicted influence value.27 Pair this with **Bayesian RAG (BRAG)** confidence scoring to gate generation.31

## **Context Compression Framework**

### **Purpose**

To compress, summarize, and prune active interaction trajectories and long document contexts, preserving strict syntactical formats and operational dependencies.8

### **Inputs**

* Active, raw trajectory history ![][image27] (ATO sequence, tool returns).8  
* System token budgets and performance limits.8

### **Outputs**

* Compressed context block ![][image28] containing consolidated learnings and structural index pointers.8

### **Risks**

* **Hallucinated Summarization**: The compression step invents non-existent relationships or facts, leading to downstream errors.7  
* **Uncertainty Erasure**: Compressing highly qualified, tentative observations into direct, flat statements of fact.31

### **Failure Modes**

* **Syntax Mutilation (F2)**: Summarizing structured programming blocks, SQL schemas, or command-line arrays, rendering them un-executable.8  
* **Pre-Compression Loss (F1)**: Deleting a raw observation that becomes highly critical in a subsequent planning phase.8

### **Human Approval Requirements**

* Automated compression does not require human approval, but the semantic correctness of the compression model must be audited regularly against raw histories.12

### **Recommended Implementation Patterns**

* Implement the **Focus Slime-Mold exploration model**.16 Scaffold the agent to use explicit start_focus and complete_focus tools, forcing self-regulated trajectory condensation.16 Combine this with **Evaluator Head-based Prompt Compression (EHPC)**.15

## **Context Freshness Framework**

### **Purpose**

To maintain long-term memory validity by de-duplicating, clustering, and decaying episodic and semantic knowledge nodes.12

### **Inputs**

* Long-term memory stores (![][image2]).1  
* New, incoming consolidated interaction logs.1  
* System real-time clock and epoch parameters.9

### **Outputs**

* An updated, de-duplicated, and chronologically consistent long-term database state.1

### **Risks**

* **Premature Decay**: Decaying highly critical, rarely accessed, but permanently valid guidelines (such as corporate legal terms).  
* **Conflict Over-Writing**: Accidentally deleting a valid historical guideline when encountering a temporary, incorrect user statement.

### **Failure Modes**

* **Duplicate Fact Accumulation**: Failing to de-duplicate near-identical facts, leading to search-space pollution and biased generation.1  
* **Stale Action Execution**: Executing a plan using outdated configuration context that has been modified, violating system integrity.19

### **Human Approval Requirements**

* Decay parameters (![][image13]) are automated, but pinning critical, permanently valid records to bypass decay requires database administrator authorization.12

### **Recommended Implementation Patterns**

* Run scheduled offline optimization routines.12 Use clustering models to consolidate near-identical records, apply exponential decay curves to episodic nodes, and run MD5/SHA-256 validation checks to maintain synchronization between database states and active caches.12

## **Context Governance Framework**

### **Purpose**

To enforce strict zero-trust parameters at the metadata layer, guaranteeing complete compliance with privacy laws (GDPR, HIPAA) and corporate access rules.19

### **Inputs**

* Retrieved candidate context vectors.19  
* User identity tokens, role parameters, and task clearance levels.23  
* Global privacy matrices and corporate data compliance definitions.23

### **Outputs**

* Redacted, validated, and authorized context blocks approved for prompt injection.23

### **Risks**

* **Adversarial Leakage**: An attacker uses sophisticated prompt injection to bypass regex redact-filters, leaking sensitive context.  
* **Context Invalidation Failure**: Downstream models act on a context block that has already been revoked or deleted.6

### **Failure Modes**

* **PII/PHI Leakage**: Sensitive medical or financial records are injected into the context window, violating HIPAA/GDPR constraints.20  
* **Audit Trail Breakdown**: Failing to log the exact context version used to guide a high-stakes decision, leaving the system un-auditable.19

### **Human Approval Requirements**

* Overriding a data access lockout or modifying global privacy masking rules requires explicit, multi-party human approval.

### **Recommended Implementation Patterns**

* Implement **ContextNest-style isolated Context Vaults**.23 Use a zero-trust metadata firebreak to validate the hash of every retrieved chunk before injection.19 Maintain an immutable SHA-256 hash-chained context transaction ledger.23

## **Evidence-Aware Retrieval Framework**

### **Purpose**

To construct a verified execution provenance graph, linking every claim, decision, and system action to its explicit supporting evidence.24

### **Inputs**

* Retrieval traces (search queries, candidates, citation metadata).24  
* Reasoning traces (intermediate plans, thoughts, self-critiques).24  
* Tool execution traces (arguments, inputs, environment returns).24

### **Outputs**

* An interactive, evidence-aware provenance graph displaying the support, contradiction, or validation state of each claim.24

### **Risks**

* **Citation Hallucination**: The model generates a syntactically correct citation that actually links to an unrelated document.30  
* **Provenance Bloat**: Storing full, multi-layer trace logs for every intermediate step, creating storage bottlenecks.

### **Failure Modes**

* **Attribution Disconnection**: The agent makes a high-stakes operational claim or execution choice that cannot be traced to any retrieved evidence.36  
* **Contradiction Blindness**: Failing to flag when retrieved tool outputs directly contradict the system's pre-existing semantic rules.24

### **Human Approval Requirements**

* If a claim-to-citation alignment check drops below a 95% confidence score on high-risk tasks, the system must block execution and seek human validation.37

### **Recommended Implementation Patterns**

* Deploy **FactReview** and **DeepSciVerify** architectures.30 Require the agent to run progressive factual verification checks, evaluating claims against document abstracts first, and escalating to full-text passages only when uncertainty remains high.30

## **Graph \+ Memory Retrieval Framework**

### **Purpose**

To navigate long-term memory relationships dynamically, utilizing energy propagation kinetics to resolve multi-hop dependencies without relying on flat semantic lookups.9

### **Inputs**

* Input query concept node ![][image7].9  
* Unified Episodic-Semantic Graph memory structure.9

### **Outputs**

* An activated memory sub-graph defining structurally and contextually salient nodes.9

### **Risks**

* **Hub Page Saturation**: High-density nodes (e.g., highly connected concepts) absorb and spread too much activation energy, causing hub explosion.10  
* **Energy Dissipation**: The activation signal decays too rapidly, failing to reach structurally important but distant nodes.9

### **Failure Modes**

* **Contextual Tunneling**: The system fails to retrieve a critical schedule conflict or dependency because it is structurally distant from the initial query.9  
* **Energy Divergence**: Activation energy flows down a noisy, associative path, flooding the workspace with irrelevant records.9

### **Human Approval Requirements**

* Automated background graph maintenance, relationship indexing, and schema induction operations run continuously and do not require human-in-the-loop validation.21

### **Recommended Implementation Patterns**

* Deploy the **Synapse memory architecture**.9 Model memory as a dynamic graph, utilizing spreading activation alongside temporal decay and lateral inhibition to control signal flow.9 Run a sigmoid activation function to select retrieved nodes.9

## **Operational Context Engine Architecture**

### **Purpose**

To serve as the centralized, high-speed cognitive operating system that coordinates the retrieval, validation, compression, governance, and reasoning integration of context across multi-agent clusters.2

### **Inputs**

* All user and agent query states, environmental tool streams, system logs, and security credentials.6

### **Outputs**

* A continuous, low-latency stream of audited, prioritized, and compressed contextual frames that ground downstream LLM reasoning nodes.1

### **Risks**

* **Operational Sync Loss**: The active cache desynchronizes from the underlying vector databases, leading to cache poisoning.15  
* **Orchestration Latency**: Layered prioritization, validation, and redaction pipelines push execution times past target SLAs.

### **Failure Modes**

* **Transactional Inconsistency**: An agent executes an API write operation based on stale, cached context, violating operational bounds.6  
* **Governance Leakage**: High-speed cache hits bypass the zero-trust metadata firebreak, letting unauthorized context enter the prompt.19

### **Human Approval Requirements**

* Changes to the engine's core orchestration policies, escalation triggers, and security vault interfaces must be approved by security architects.

### **Recommended Implementation Patterns**

* Construct the core runtime engine using the **SagaLLM** orchestrator.6 Pair it with a high-speed **WikiKV** path-indexed storage model to manage points lookups and budgeted navigation queries.21 Run a zero-trust metadata firebreak at the cache gateway.19

## **Architectural Recommendation and Justification**

To build a long-term operational AI system that remains contextually precise without becoming noisy, biased, invasive, or outdated, the **Unified Cognitive Ledger & Curated Memory (UCL-CM) Architecture** is recommended.  
This architecture integrates the specialized research paradigms established in the 2024ג€“2026 cognitive systems literature, combining structured, path-indexed storage with dynamic, graph-based relationship activation and strict transactional validation.6

\+-----------------------------------------------------------------------------------------+  
|                                    User/Agent Query                                     |  
\+-----------------------------------------------------------------------------------------+  
                                             |  
                                             v  
\+-----------------------------------------------------------------------------------------+  
|                              Zero-Trust Metadata perimeter                              |  
|           \- Role-Based Access Control Checks (ContextNest Cryptographic Vaults)         |  
|           \- Lineage Validation & Checksum Verification (Metadata Firebreak)            |  
\+-----------------------------------------------------------------------------------------+  
                                             |  
                                             v  
\+-----------------------------------------------------------------------------------------+  
|                             Unified Episodic-Semantic Graph                             |  
|          \- Synapse Spreading Activation Engine (Sigmoid propagation, Decay)             |  
|          \- Lateral Inhibition Engine (Active Distractor Suppression)                    |  
\+-----------------------------------------------------------------------------------------+  
                                             |  
                                             v  
\+-----------------------------------------------------------------------------------------+  
|                               Curated Storage Substrate                                 |  
|          \- WikiKV Path-Indexed Store (O(1) lookups: Index-\>Dimension-\>Entity)           |  
|          \- Self-Evolving Error Book (Auto-constraint injection & repairs)               |  
\+-----------------------------------------------------------------------------------------+  
                                             |  
                                             v  
\+-----------------------------------------------------------------------------------------+  
|                             Context Triage & Compression                                |  
|          \- Focus Slime-Mold Scaffold (start_focus / complete_focus loops)               |  
|          \- Evaluator Head Prompt Compression (EHPC attention-based pruning)             |  
\+-----------------------------------------------------------------------------------------+  
                                             |  
                                             v  
\+-----------------------------------------------------------------------------------------+  
|                           Inference & Transactional Verification                        |  
|          \- SagaLLM Multi-Agent Orchestrator (ACID Transaction Boundaries)               |  
|          \- BRAG Selective Bayesian routing (Answerability Gates & Provenance)           |  
\+-----------------------------------------------------------------------------------------+

### **Analytical Perspectives on the Recommended Architecture**

#### **The Enterprise AI Architect**

The UCL-CM architecture addresses the economic and technical challenges of scaling agentic systems.1 By moving away from full-history prompting, which is cost-prohibitive and introduces high latency, UCL-CM structures long-term memory into isolated databases.1 This structural division achieves sub-second latency and reduces token consumption, supporting consistent performance across hundreds of active user sessions without requiring GPU memory upgrades.1

#### **The Knowledge Graph Architect**

The use of the **Unified Episodic-Semantic Graph** via the **Synapse** framework transforms how relationships are navigated.9 Instead of relying on isolated vector lookups, memory is managed as a dynamic network of concepts and experiences.9 The system employs spreading activation and lateral inhibition to surface structurally important context even when direct semantic overlap is absent, while suppressing irrelevant, highly connected hub nodes to prevent context bloat.9

#### **The AI Memory Researcher**

The UCL-CM architecture implements the memory taxonomy of the Princeton CoALA framework, separating working memory (in-context), episodic logs, semantic concepts, and procedural rules.1 The integration of the **Focus** agent's slime-mold exploration pattern introduces active, self-regulated context compression.16 Rather than using passive system-level truncation, the agent actively consolidates its trajectory into high-level knowledge blocks and prunes its raw tool history.16 This active management reduces context bloat and prevents previous errors from distracting the model during reasoning.16

#### **The Information Retrieval Expert**

The search layer utilizes **WIKIKV**, a path-indexed key-value storage engine engineered for hierarchical workloads.21 By compiling unstructured corporate documents into structured, interlinked Wiki pages with explicit wikilinks, retrieval transitions from a black-box lookup into an active process of link traversal and verification.7 Point lookups and directory listings are resolved in ![][image29] storage round-trips under strict latency SLAs, and the system evolves through continuous schema-induction operators.21

#### **The Human-Computer Interaction Researcher**

To maintain trust, the architecture incorporates **FactReview** and execution provenance tracking.24 Every claim, tool execution, and planning choice is mapped to its explicit supporting evidence on a visual provenance graph.24 When uncertainty is high, the system leverages Bayesian answerability gates to abstain or escalate to a human analyst rather than generating a speculative, ungrounded response.31 This selective response design prevents hallucinatory behavior and supports safe human-agent collaboration.31

#### **The Intelligence Analyst**

The inclusion of a persistent, self-evolving **Error Book** ensures the system remains robust and self-correcting over time.7 By capturing structural and semantic compilation errors at ingestion time, attributing their root causes, and converting them into reusable prompt constraints, the system prevents the recurrence of historical mistakes.7 This ongoing self-correction maintains the accuracy of the corporate knowledge base over extended operational horizons.7

#### **The Decision Scientist**

The integration layer is governed by **SagaLLM**, which enforces strict transactional boundaries across multi-agent plans.6 By establishing contract, consistency, and temporal validation protocols, SagaLLM guarantees that agent decisions remain aligned with corporate rules and system configurations.6 The zero-trust metadata firebreak checks the cryptographic checksum of every retrieved chunk, protecting the system's reasoning path from context poisoning or stale dependencies.19

### **Architectural Justification and Operational Synthesis**

The UCL-CM architecture addresses context management by treating it as an active system-level capability rather than an inference-time prompt optimization trick.8 By isolating security permissions at the metadata perimeter, navigating relationships through a dynamic memory graph, and structuring data within a path-indexed key-value store, the architecture ensures that the system's active context window remains focused, verified, and secure.9  
The active, agent-controlled compression protocols prevent memory bloat, and the transactional validation layers ensure that every operational decision is supported by a clear, auditable provenance trail.6 For organizations deploying AI systems in high-stakes, long-term environments, this unified approach provides the reliability, security, and cognitive focus required for autonomous execution.

#### **׳¢׳‘׳•׳“׳•׳× ׳©׳¦׳•׳˜׳˜׳•**

1. Long-Term Memory for AI Agents: The What, Why and How \- Mem0, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://mem0.ai/blog/long-term-memory-ai-agents](https://mem0.ai/blog/long-term-memory-ai-agents)  
2. What is Context Engineering? Definition, How It Works | AtScale, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://www.atscale.com/glossary/context-engineering/](https://www.atscale.com/glossary/context-engineering/)  
3. Types of AI Agent Memory: Episodic, Semantic, Procedural and More \- Atlan, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://atlan.com/know/types-of-ai-agent-memory/](https://atlan.com/know/types-of-ai-agent-memory/)  
4. The Need to Improve Long-Term Memory in LLM-Agents, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://ojs.aaai.org/index.php/AAAI-SS/article/download/27688/27461/31739](https://ojs.aaai.org/index.php/AAAI-SS/article/download/27688/27461/31739)  
5. Project Synapse: Integrated Research Framework \- Emergent Mind, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://www.emergentmind.com/topics/project-synapse](https://www.emergentmind.com/topics/project-synapse)  
6. נ–²נ–÷נ—€נ–÷נ–«נ–«נ–¬: Context Management, Validation, and Transaction Guarantees for Multi-Agent LLM Planning \- arXiv, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://arxiv.org/html/2503.11951v1](https://arxiv.org/html/2503.11951v1)  
7. Retrieval as Reasoning: Self-Evolving Agent-Native Retrieval via LLM-Wiki \- arXiv, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://arxiv.org/html/2605.25480v1](https://arxiv.org/html/2605.25480v1)  
8. Context Compression for LLM Agents: A Survey of Methods, Failure Modes, and Evaluation, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://www.preprints.org/manuscript/202605.2065](https://www.preprints.org/manuscript/202605.2065)  
9. Synapse: Empowering LLM Agents with Episodic-Semantic Memory via Spreading Activation \- arXiv, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://arxiv.org/html/2601.02744v3](https://arxiv.org/html/2601.02744v3)  
10. SYNAPSE: Empowering LLM Agents with Episodic-Semantic Memory via Spreading Activation \- arXiv, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://arxiv.org/pdf/2601.02744](https://arxiv.org/pdf/2601.02744)  
11. Beyond Short-term Memory: The 3 Types of Long-term Memory AI Agents Need \- MachineLearningMastery.com, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://machinelearningmastery.com/beyond-short-term-memory-the-3-types-of-long-term-memory-ai-agents-need/](https://machinelearningmastery.com/beyond-short-term-memory-the-3-types-of-long-term-memory-ai-agents-need/)  
12. Context Engineering: Memory and Temporal Context \- Daily Dose of Data Science, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://www.dailydoseofds.com/llmops-crash-course-part-8/](https://www.dailydoseofds.com/llmops-crash-course-part-8/)  
13. Reflections on Hierarchical Memory and Local Contexts in LLMs with Self-Organizing AGENTS.md | by Sergei | Medium, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://medium.com/@chipiga86/reflections-on-hierarchical-memory-and-local-contexts-in-llms-with-self-organizing-agents-md-84564139a5f7](https://medium.com/@chipiga86/reflections-on-hierarchical-memory-and-local-contexts-in-llms-with-self-organizing-agents-md-84564139a5f7)  
14. How I implemented 3-layer memory for LLM agents (semantic \+ episodic \+ procedural), ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://www.reddit.com/r/LLMDevs/comments/1s8njqy/how_i_implemented_3layer_memory_for_llm_agents/](https://www.reddit.com/r/LLMDevs/comments/1s8njqy/how_i_implemented_3layer_memory_for_llm_agents/)  
15. Context Pruning: Cut LLM Tokens Without Losing Quality \- Redis, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://redis.io/blog/context-pruning-llm-tokens/](https://redis.io/blog/context-pruning-llm-tokens/)  
16. Active Context Compression: Autonomous Memory Management in LLM Agents \- arXiv, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://arxiv.org/pdf/2601.07190](https://arxiv.org/pdf/2601.07190)  
17. Active Context Compression: Autonomous Memory Management in LLM Agents, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://www.researchgate.net/publication/399708377_Active_Context_Compression_Autonomous_Memory_Management_in_LLM_Agents](https://www.researchgate.net/publication/399708377_Active_Context_Compression_Autonomous_Memory_Management_in_LLM_Agents)  
18. Active Context Compression: Autonomous Memory Management in LLM Agents \- arXiv, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://arxiv.org/abs/2601.07190](https://arxiv.org/abs/2601.07190)  
19. The ג€Context Poisoningג€ Crisis: Why Metadata Is the New Security Perimeter \- Dataversity, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://www.dataversity.net/articles/the-context-poisoning-crisis-why-metadata-is-the-new-security-perimeter/](https://www.dataversity.net/articles/the-context-poisoning-crisis-why-metadata-is-the-new-security-perimeter/)  
20. Contextual Intelligence in AI: How It Works and Why It Fails \- Atlan, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://atlan.com/know/contextual-intelligence-ai/](https://atlan.com/know/contextual-intelligence-ai/)  
21. WikiKV: Schema-Evolving Path-Indexed Storage for Hierarchical Knowledge Navigation \- arXiv, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://arxiv.org/pdf/2606.14275](https://arxiv.org/pdf/2606.14275)  
22. WikiKV: Schema-Evolving Path-Indexed Storage for Hierarchical Knowledge Navigation, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://arxiv.org/html/2606.14275v1](https://arxiv.org/html/2606.14275v1)  
23. Enterprise AI Governance Platform | Agents, RBAC & Audit Trails \- PromptOwl, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://promptowl.ai/promptowl/](https://promptowl.ai/promptowl/)  
24. From Agent Traces to Trust: A Survey of Evidence Tracing and Execution Provenance in LLM Agents \- arXiv, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://arxiv.org/html/2606.04990v3](https://arxiv.org/html/2606.04990v3)  
25. [2605.25480] Retrieval as Reasoning: Self-Evolving Agent-Native Retrieval via LLM-Wiki, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://arxiv.org/abs/2605.25480](https://arxiv.org/abs/2605.25480)  
26. Retrieval as Reasoning: Self-Evolving Agent-Native Retrieval via LLM-Wiki \- arXiv, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://arxiv.org/html/2605.25480v2](https://arxiv.org/html/2605.25480v2)  
27. Influence Guided Context Selection for Effective Retrieval-Augmented Generation \- arXiv, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://arxiv.org/abs/2509.21359](https://arxiv.org/abs/2509.21359)  
28. SYNAPSE: Empowering LLM Agents with Episodic-Semantic Memory via Spreading Activation, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://www.semanticscholar.org/paper/SYNAPSE%3A-Empowering-LLM-Agents-with-Memory-via-Jiang-Chen/a0bd272b7d4ac151fbd0724f3cc77e2e2fa6941c](https://www.semanticscholar.org/paper/SYNAPSE%3A-Empowering-LLM-Agents-with-Memory-via-Jiang-Chen/a0bd272b7d4ac151fbd0724f3cc77e2e2fa6941c)  
29. Self-Evolving Agent-Native Retrieval via LLM-Wiki \- arXiv, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://arxiv.org/pdf/2605.25480](https://arxiv.org/pdf/2605.25480)  
30. (PDF) DeepSciVerify: Verifying Scientific Claim--Citation Alignment via LLM-Driven Evidence Escalation \- ResearchGate, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://www.researchgate.net/publication/405371458_DeepSciVerify_Verifying_Scientific_Claim--Citation_Alignment_via_LLM-Driven_Evidence_Escalation](https://www.researchgate.net/publication/405371458_DeepSciVerify_Verifying_Scientific_Claim--Citation_Alignment_via_LLM-Driven_Evidence_Escalation)  
31. BRAG: Bayesian Retrieval-Augmented Generation; A Methodological Framework for Evidence-Governed Decision Support \- MDPI, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://www.mdpi.com/2504-4990/8/6/151](https://www.mdpi.com/2504-4990/8/6/151)  
32. Context Compression for LLM Agents: A Survey of Methods, Failure Modes, and Evaluation \- Preprints.org, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://www.preprints.org/frontend/manuscript/098fda1d1490b8885d002521dbc08afa/download_pub](https://www.preprints.org/frontend/manuscript/098fda1d1490b8885d002521dbc08afa/download_pub)  
33. Yifei Wang's research works | Chinese Academy of Sciences and other places, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://www.researchgate.net/scientific-contributions/Yifei-Wang-2279092475](https://www.researchgate.net/scientific-contributions/Yifei-Wang-2279092475)  
34. Active Context Compression: Autonomous Memory Management in LLM Agents \- arXiv, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://arxiv.org/html/2601.07190v1](https://arxiv.org/html/2601.07190v1)  
35. Dynamic Context Selection for Retrieval-Augmented Generation: Mitigating Distractors and Positional Bias \- arXiv, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://arxiv.org/html/2512.14313v1](https://arxiv.org/html/2512.14313v1)  
36. From Agent Traces to Trust: Evidence Tracing and Execution Provenance in LLM Agents \- arXiv, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://arxiv.org/html/2606.04990](https://arxiv.org/html/2606.04990)  
37. FactReview: Evidence-Grounded Peer Review with Execution-Based Claim Verification, ׳ ׳¨׳©׳׳” ׳’׳™׳©׳” ׳‘׳×׳׳¨׳™׳ ׳™׳•׳ ׳™ 17, 2026, [https://arxiv.org/html/2604.04074v3](https://arxiv.org/html/2604.04074v3)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAZCAYAAAC2JufVAAAB2UlEQVR4Xu2WMSitYRjH/0IRMpDbDZENoxWlrG5RdxCDjclgUSZ1u7skg0UGJMpgQ/lKKdM1UBJ1GBgkE4vE/+/5Xud9T+IMx3eX71e/cr7nPd953ud53jdASsr30k2X6Ck9ov1hOKCU/qVXsVrf7C8oNPqxB7pLK3JijkW6R1/oUE6s4JTRdXpDT2htGH6jiA7SDL2jrUH0G2igESwhJdYSRI2u2Ce6T6vCcOHppauwxNTCjiAKVNMFOglr3WwYLjyudZ2wudKPTnjxdjoHG/IMEm5dPR1FWAklooSUmEi8dSW0D5bUMmywf9Px7NIg4TZ6SC/oP1jLe2DVPIOdUm14i97SczqjL+bDFGxWhF6smYpoJWyONE9CbVZSA/FnoTUbsA05LmHvdOh6madN3rNP8VsndBXoBGpuNFeqlkMVzW2d4hEsOaF2X8MuY8c0Lfc+f4l+aBNWBaFd6fJURY7dohhV86NTp8r8jP/W+yKEF7AOUN5oVwd0m/7wnmuXz/SX96yG7tARWuw9Fy4ptVmnVwlFsOo1ImxtYmgGNWeaIyWgTSlRHZoxb12iPNI1ZK8NJXdPV2idW5Q0mr8/yB4Kd+sPv6/4D+iu8iui/x40p+5EpqSkOF4BTl1fLdFEoUEAAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAAAaCAYAAAAUqxq7AAADeUlEQVR4Xu2YS6hNURjH//IOeZaEyKM8Q2IkKY88IgNKSchAJkiiTIyUASmvDMiVDDyKElLK9Rh4DBh4jNRlwEhSKBS+n2+vztrrnnO69zxu1P7Vv+Oste5e3/5eax1SQUFBwb/DZNNJ0yPTO9MZ06DcijwDTefka5+bjpvGxgsayH7TNfleaGZ+uh3bTG/ka/lclp+ujWGm1aYdpt+mj3KnlaObabfph3ztGtMKU794UQNZaFpneibfb2t+uh1t8nVvTZtMY+LJelkkz4ifpnnJXGCuPHtemH4lc82CAD6UZ9KBZC6GzL4sd9DRZK5u+piuyx/MBnvz038he9bKo8iaG/nppsF+p+UBbDX1z806BO6wPPurVUDNjJL3oF3yl8egFIzobTqryk5sNATlgmm9aYa8rwzPrSj1xAlyu1pV3ol1QXSumlaqlB1kVYANW+Tp/lLVy7CRsN9deUaMUPnsIKg4ELC9WhnWDA8lI2abvpqemgZH88EInIJzykWyGbDfTXmAUBqYWaZTpp5ye3FQQ06umHGmB6aRKmUITsJZfeXlNjVbe0X50wSjMfCV/GhtzfQk+z49W1crl0yrou9pacenGgFMM3+O6bE8wFtMB007o/kOgQEY0kN+XN+RG0K5YUBsRJvpm3zjGDLwQzI2Ue3LobMQOAIYwC76DRA0Agj0Knrjvux74J7yR32bvJ10Ck4uPBzAAAxh7LzyDY+jnQwj0wJEjMjh2Jju8r5RD7eUv2NhF/uwf0s0HjI/fnmclvYjnEildJgBptvK1zUpjCGH5DUewzibsHmACJM9wZiNpikq9Y16SF8w9Mftygc19Mb45dmbyqA/BbimUCkdgghflDfcaSq9NFEgU+KMYI5r/vdsPnYQL4Hj3pu+qL0DU+hprEeVGCp3wgblX5As+SS/cgQ45rnD8bx4LdzPxoPS+YrQGzgy4z/mthrmXsuN6CW/wcbrgjgtQnmF5hj6FgzJPlMWmz6r/E08PC/eh54XHIIj9qgUgNQmlN7hyKSl8p8r3KW6lLS85pvGZ//enH1WItxdmgFOWZ6MUYaczF0K5cYP1/RkGG06kYzFkAFH0sEGgiOOJWPYGB8uXUI43uOjmNLiRyO/wivBEU3pNguyk7tYgIyiPP8LOLYnqXojrwdOKTKY5y8wLVHz/jumoKCgoKCr+QMk6sMnMQklDgAAAABJRU5ErkJggg==>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAbCAYAAACjkdXHAAAA3klEQVR4XmNgGAUjFTACsTAUg9hEg1wgfgbFT4D4Lqo0biABxFeAWAXKNwHip0DMDVeBA/AD8R4gNkQSWwjE/4GYBUkMK8hhgChE9qM8EPsyQFyUxwCxAAMIAvFpIP6HLgEFnkB8nwFiGAYwBuKvQHwATZwooATEzxmwa7YA4ktA7IcuAQMgf05ggEQPspgTAyS65gNxA5IcBgAFxgoGSAivBOKHQLwAiOOA+CoQ28BV4gGSQCwOxKxIYqcYIIFKMgAZBLIVFJXaaHIEAcg7PUCcyUBiOocBrIljFJABACkzH0p2LeKpAAAAAElFTkSuQmCC>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAaCAYAAAC+aNwHAAABBUlEQVR4Xu3TP0uCURTH8RMlFPmHcMgmnQTBrcHNlxAiDeLkKEhr4N7SC2gRVwlaJchFRLfegJODg0ODNtma38N9wMej3tzzBx/Qc65HvR5F/kWiuEHE1O3zrTxhhl8s8INHXCCN3ProZvTAM6aoIRHU4+ighwmugvpGUhiKe1cdZJPEp7j+VrriGm/i/35lzG1Roy/+Rt42THTAwBavxQ14xZnp2RRQtMWKuAF3tnFIzvGOEWKmd1B0UQYBfexLHQ1b1LTl7wG6Dx+4tQ2N3sFY3GXui27hi3guWX/CJao4DdUv0RS3ZN5kZb1lOqyFPr7wEDrnzQkyKOFe3B8m/GmOOWZnVjnCKe2Ge9NDAAAAAElFTkSuQmCC>

[image5]: <data:image/png;base64,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>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAaCAYAAAC+aNwHAAABG0lEQVR4Xu3SLUuDYRTG8SO+4MBXDE4QtCp2sYjBLGPJKBa/gfoBVpYEo2AwiGASxGAb2uxiMigaVTAYDOr/4jxu987jxrq74AfPzrl3npf7NvsXGcIU+kM9/s6lgmd84xUf2EYBM5hrLG2OFlTxgA2MZvURHOMS9xjP6k0p4sr8rhoUM4Eb834u5+aNU2v/fmW8xKKiP79hITZCNKAWi5PmA07QF3oxi1iOxXXzAWux0UkGcYFrDIeeMmZ+DqJ6dFBqGV2nGcAhHs2fUD5xmy5SjuzvAWn05b+wGhvKFu7MP2ar6O5PmI6N32gL9Xib6E3qOlC75gN2knou89Y4ZRp2gDO8Yx97WKqvbpEezKJkvrUr5rvUTTdt8wM9szOmTfujcQAAAABJRU5ErkJggg==>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAaCAYAAACO5M0mAAAAvElEQVR4XmNgGAW0AqxALALEzFA+G5IcHKwC4tdAfA6IrwKxFxAXoagAAk0gngPEnFB+OBD/A2IbuAogKAfi/8gCQGAMxF+BmAMmAHIPyBqQbmQQzYCmGabzCbIgA8QZKJphCg8giQkC8WkgfoAkBnb8DqgECKgA8S0GiLUgt6MAkI+vAfFGID4CxOcZINa6ICuCAVAAC0MxyHSQm2VQVKABmJu3MiAFDTaQzgBxXxW6BDIIQcOeqNLDBAAAqe8jfqJZSZ0AAAAASUVORK5CYII=>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAaCAYAAABozQZiAAABH0lEQVR4Xu2SvUpDQRCFj/iDARshkEYQxCZirRhsfQIbC3tDyjQWWvgYIjZWPoFgKdhpJxEhlYGAlUmVIglqzslsbnaH3CeIH3yEO+fe2d3ZAPPLIq3QO7rvshi9d0xXJoUyfaN/QTXIowp7J6MO66auCs7jMGKNPtGeq48p0D498EFAdeWPPhBX9MQXA7u0S79hx0wo0Y/w61mit7AjPdDVNLYVk0FEHNEf5MxDZ9U5tK1ZvMA+HNJDl2WDuPcBWcD0Ct9pMY2BT/pFt1x9j3boNezjszQ2fukrXY9qm7RJb+gzcrYs1LVNN8LzNmzyWlHz0K5m7WzM5EwX9BR2l5d0OeRatQW7a/3/dXUZDUwbaLI7cRhlA1qDDfGfOWIEgzo/MH0UEfMAAAAASUVORK5CYII=>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAeCAYAAADU8sWcAAACB0lEQVR4XuWWP0gcQRSHX1AhIYop0kiERLExSaU2/klnDBZaiJDCxkbSCAFTJFiYa6y0UEsRIYqSThsbG0VBBGsRhBSBgGAjFkkREP39nNnc3Nu5y547e40ffHj7Zt2ZnTfzZkXuzmP4VQct9XAGNuqGEFTDOfhWNzi0wG86GII3cBnWOLGHcMO5JlPqOjXN8Mj+demFP1Ss1saDwYdti3kw6Ya78Az+gWM2HjGhrlPxAa7BB06MU74FJ51YxJIOpOGzxBcSU/BT/FOs701MA3ziXNfBLxJ/YJRv39bS95akA56L2UqE0/vOxpi/frgj+ZxHUz5t731l4xGJc86Rn4jp2M0pycEe8a/2T2K22bwTIxwg/ycROfgbtqs4GYDPxBSYdThY2HybHs6Cy2sx1e6/MJ/78Jf4c8fO2TFhZVuRwiLjI3GR4eLiir2GoxKf9lbndybllVN5JWYAkZfwvcQHkwkv4Xf4V/ID4IBKvWVw+KYfxSxADiBopdLolRoxLqbzsvJXLlzNPhhn5wu6IRRcyXxDDffonhSeYuXCouXbuv8YghewS8VX4Sl8ruJB4ZTyHOZ5zNK5KCbHB/BF/rbwVMFO+5sfhX1wBA5Lur3dBjfFf8xmCtfKrJiqmfhUC00OPtLBSvAUHos5CWlFYa55UPG7rkm1ZQ6/aA6lePHKnGIl+55zA5HFUPVsL+t9AAAAAElFTkSuQmCC>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAcCAYAAACtQ6WLAAAAkElEQVR4XmNgGBxAEIgZ0QVBgBWI/wOxJ7oECAgD8XMg1kSXgAEOdAGCgJkBYiwGUAHi00D8GojlkSVcgLifAeL8dCCOQJYEOdsUiDmBeAcQKyJLwoAOEL9nwBEADUD8D10QBPiB+AQQXwdiZSAORJa0AeLfQDwJiEsZ0BzlywAJUxC9nAGLf0HBJokuOOIBACXsEVMbAsH9AAAAAElFTkSuQmCC>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAeCAYAAADgiwSAAAAAo0lEQVR4XmNgGOpABV0ABhSBeCG6IAy0ArELuiAIcADxViCWRhbMA+L/aPgnEFuCJHmAWBKII4D4H5QtBsTMIEkYKGeA6MIALEC8Boifo0uAgDgQ3wXiA2jiYGADxL+BeBK6BAgUMUDsC2KAWAFynDBIAmbfWyDWBGJjIF4MxJxgbQyQIHvIAPHGKiA2g0mAgC8QfwTiDUDsiSwBA7DAGAXIAAD8ORoJ0Ewr5QAAAABJRU5ErkJggg==>

[image12]: <data:image/png;base64,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>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAaCAYAAACD+r1hAAAAxUlEQVR4Xu2RzQpBQRiGP0VRFmJhY4Fs7JRSVjZchVtwG+7Ayg24BQtp9uyVsrFxBRbIzzMNp+nrzGyVPPUs5n3PNDPfEfktKrjFKy5UFySHc3xiVnVBunjGpi5ijNFgUeVBGnjBvi5CZMS9Y6qLGA/cYVUXaZTxJu4UO+LoxGq4wYG4d5wkMrEW7nGFBVyKO2Xif/Shg0dci7uSxY7XbjDvdcIQD9hWuZ3WTNymBPtzDPb80GOEd6z7YclfpGD7vA7/fI8XXVkeg7zZxLIAAAAASUVORK5CYII=>

[image14]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAZCAYAAAA4/K6pAAAA5ElEQVR4XmNgGAVUBSxAvByIfwKxJZocUUAaiB9AMYhNMrAB4t9AvBWIOdDkiALlQPwfiHPQJQgBHiCWBOLnQHwDiLWhfJLBPyBeCsSM6BLEApDz05H4fECcD8SzgDgPSRwr4Abir0BsjCQGCsxwIGaG0vxIchjAD4jnMyCcLwvEy5D4oDQyB8rGClqBOBrKBmmaDMQLEdJgcIABEuBYwSQGSOoDaQY5dwYDiQaAgDgQC0DZoDBBN4DkBLaHAWIQCIBsBrmSJHCeAeIqEADRrkhyRIGpQLwYiI0YIDHCiio9CqgGACygH7C2GF1xAAAAAElFTkSuQmCC>

[image15]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAbCAYAAABFuB6DAAAA70lEQVR4XtWQPwtBURjG34EiilBSVsoHMCijzaDkIyhfw2JSRqski2y+gM0iZZDJoKSsikXhee5xb68Tsd5f/br3PO/5854j4j+qsAfDdsHmBI9wBCNWzaMOS2ImDOAExt5mgCBsfhjnVPY/URhXY/7rsUcaduFDTI8kCVdw5k4iATiFNx2CITzrgDvu4EZlbGcu5hSPspjdxirLwgO8qExaYlby61KBd3k/xenvCosq64hZ3FaZs2oPM68xe96+ZAseXMkbsrCGC5jXE1x4EV4oJF8e2oVHp+zwE7wMH/0nS9iHBbtg04A1mLALfuMJAlApXujb29MAAAAASUVORK5CYII=>

[image16]: <data:image/png;base64,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>

[image17]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAZCAYAAABQDyyRAAABSElEQVR4Xu2STytFYRCHp1D+lZSUUsrmplCSnTUrGxuLuxaLu7vdlNUt+QI2Fj6AjbLBhrJgQUo2yhKJsvABKPx+zYwzXUWdDt3F+9TTmXfet3PmvDMiiUQi0STMw2d4Dx/hu8XuYXa0eCbgZViPNqxJS8O6UEbgUFhX4JHFy/AV3mXbf0s73IcbIcf2/FsBS/ANTofcnHwvoM0slFa4Ax/gYMjHAvjRKtw1GTNXEh3WE7gIr+Cm6Hydw1vYKb8wDJ9E+98V8rEAzsQB7DAZM0euReeHTIm+j8zAmsU/wj/pt2fECxiw50rYY+x7bBtvbxzWRWeJ+TXR2cqNF9An+pfrYY/xBeyFPfAMbsFVeCPaooWv0zmJLeALvQXd8NhyTl10iGdFb4AFeytywf6+wA84JtkQ7pk+hM4kPBW9rTLcFh3uRKJ5+QSOPUGLLKkhygAAAABJRU5ErkJggg==>

[image18]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAaCAYAAAAue6XIAAABIklEQVR4Xu2VsWoCQRCGR6KQIhBTBUkgNqkttAp5gDR5AstAXiCQtHkHGwsF7e0sbC0lTZ4gIBa+gQERTP5hUnhzK5k9yaaZD77iZnbZ/2BvjshxnEOowLou7uMK3sCSbvwxRyTnvsFpthXmFM7gBzxXPQvXumBkCbfwE36RMWybZPGLbhjp6EIk9xQRtgc38FY3jCQJ+0CySBtLkrAnsEZyZ8bw8uc5liRhGf76rVegSvIy2n6gxh7Ltl8xhz2Dc3ih6ho+eAAXAdeBGnvHGw2YwzbgCJZ1I4Jk14DH1u7I4gEdS7KwPLaaJL+7LnzKtk0cEpb/YI8kYd9VL0cLTkgWPpNsjqVo2BXlxyY73F2k4S+Xx1hRiob9F151wXEcx6Fvr+VHellJ1mYAAAAASUVORK5CYII=>

[image19]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAdCAYAAAAHB1RsAAACUklEQVR4Xu2XP0hVcRTHT1hhFIRliSBU4mZ/BilocFLBBv8g0qLgmE4NDUFLQzSn0iBIQ4GKIDhYgxIqOOqg0iYOtrg1BApO+f1y3sXzzrtP8t53ff7ED3zB3znCu+fe8+8nkp7r0HvonneUiCHohTdmwWVoGGrzjhS8hO6b8xVoDHpmbJkwCXU6Wz20A7U6e8SAN+S4Kvrge1CT812D5qB2Zy8pq6IPb2EQ29ADZ48Y9AZHXDDkLTTqjaVkAbphzsvQLrQPrRi7JWkwHdBP0RrNhAnokjlXQj+gd8bmSRoMbWtQjXecFOZyizeCr+4cpVhd7sxcZ3PoNRp3Z98FjwtmHar1jpPSD/3zRin8Mh9Fvwy/0C1jt5T1y9yFfkl8MEuSXzMMhAExwNfGbkkaTOqa4UN9EA0kLhjfzd5As9AI1GXslmLBMEV/i/7OH2gTemT87GZ8UYlgnUyLphgLOi4Y1sM30f/9X4ql33E8h6ZEazARHIbfRdOIb4XB2JQiWWwAnpJsAItQc+7vHokPhgSxm/GNR52KxcdgUrfFctAg+cveU9GpHs2PYGBqHchRB7NiUMHAmpiXwoJmenETZroFA2fAFylstVWiM6XP2U8T1i9/P26tKoB1wnWh0TtEv9iyaIsuF1xjtkQHc1GeQH/lqC5YLxxS5Da0YXyRMr1XnGeY8lxjOPdmJMUWcBbgNaFbdCNhmqXamssNt49q0d3ss+RfOYLklWg3vQM9dr6giK7irJuHUvyeFARMK+6JnH+foJv57vBgQBzcFd5xQQgcArPxa18XujfNAAAAAElFTkSuQmCC>

[image20]: <data:image/png;base64,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>

[image21]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAbCAYAAACjkdXHAAABK0lEQVR4Xu2Tvy5EURCHf4KKrFBIhESWB1BoFBINjcSfbEU0SoUoKFQeQCei1Ip4B4UohAegkyASvYQS32TOve49a8/uRie+5Ev23pm5M+fPSn+GCi7gMo5HsSSjeIUn+IifOFPKSLCN6+F3Dx7jRB5tghWfYlccaIVpfMXFONAqm/K1nmNfFEuyik/4If/ATjncmAF5txF9d78tZTTAxrPCwfA8hi/4lmck2JCPmtGLF/JiO7It+UR1WNdreaeMDvlFsWI75wecKsRzJuVJdiEyhuUFR4V3P1LFZ5WLV/Ad5/BGiV23EQ/wPjzbMi7DuyXcxTPsDPE6snts67SP7GM3zss3bi3PTDAk3+kid/KjaxubyLrWcDaKNcX+XYe4J19G2/TLN/Wf3/IFv4MwYhuEziEAAAAASUVORK5CYII=>

[image22]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAaCAYAAABGiCfwAAABdklEQVR4Xu2UPyhFYRjGH6EoJRQpJZKSAYsJGQwMFpNit/hTBlYlk01KyWIhsdhuJjJSykxRysYiA4Xn6f2O+95TnHtv91rcX/3qvOec73zne8/zHaBEiRJ/ST2tjJ+MUYvkexJpoY/0lY678/P0mraG+pNu0YrvO3Kkmh7CJnygB7Q8XLugt7Qp1JrslNaEOmfG6BDdpB901F3TwxddvUw3XC2WYC8aMYcsWn0HW0ldqMvoOx2IbiBrdMrV4on2ufoEWaxcq/BvrUl9C8U+bXd13miyCVf30CNkhmGPVrk6bzTZbDhWz7dpChYg0Y90e7rpAqzVu7SNrsBSqwwkskPf6DE9o+v0hV7B0qpvETFIm2GTKzS9wUlktv1XNFgPaYC9tVaowY1IbwePvt9IOFa79U01riioZVHsu+g97YD9jQqOtkIUmBnY1lmF/dYKilp4EzuXuL9yoZOewwIyDQtP0Rimz7DNfwlLYNFQ0pTUn9L5T/kCDjU2mvv7vUIAAAAASUVORK5CYII=>

[image23]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAaCAYAAACO5M0mAAAAsklEQVR4XmNgGNqAFYiF0AXRgRgQnwPin+gS6EAdiF8C8XV0CbIADxALAzEjugQymADEF4D4IRBvB2J+VGkIAPkyhwFiki8Q/wfidBQVUBANpTmAeCsQfwViY4Q0JpAG4gdAfBqIBVGlUIENEP8G4vkMBDxUzoDHfTBAtLUuQPyPgQRrYSGAAmSB2AqImRkgwfIJiPVRVEDBawaEJCi1TAdiFhQVUBAMxLOAeBIDxNThDwBwKR3PC74dWAAAAABJRU5ErkJggg==>

[image24]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAdCAYAAAC5UQwxAAABmUlEQVR4XuWWvSuGYRSHj6IMSqIQ5SOLDIooxeCrzLL5A5gtyoTFIspgMPhIshiUxIaUlNkkA4tdWSj8fh1PHed54n3uut+Uq65yznl7b/fXuV+RfNTBRVjpC6AJLkl2LYgKuAs7fMEwAFdhmS+EcAq7XW4S3sIakxuDRyYO5gJWudwa3IelJtcAr00czI6Lr+ArfIQnJs+lPzNxMHMubof3sMflif/ngph1MZdzD5a4PCl4wCHRD2841yU9wxs49fV3my1IjgG5TBOis/kQnQXjYUl/yQPsh9Vw3uSD9nAcPsFWk/On9Fj0om+KXvoEntJLE/8Kv5TL5fdsGi5I9p4l8Hpsw1GX/5FO+Cy6XJZonYbdg/tX6wsSoZdyubZEB7TdIxrJ/nHAosB7xcHYkKPDJTwQHZAdJDp8YjgzDph0kFAapYDDw2vwBl8k/e7lZUZ00ExG4LvozKy99kN/lS54CO98IQbcs2VYD8+/l+LQDAdhn+hLUhSSk872yFcjOjyAnB0f5BZXiwJfEv5iW/GFmJSLPmX/lE+ywEkOF4SKeAAAAABJRU5ErkJggg==>

[image25]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAbCAYAAABIpm7EAAAAqElEQVR4XmNgGAXDAmgB8QogfgbE/9FwL5I6MOiESvwC4kdQNgiDNIP48QilDAysQPwXiPOBmBkqNh+I/wGxB0wRMvAD4glAzIgk5ssAsaEcSQwMOIF4BxDroImnM+DQYAnEP9EFgeA6FIujS+gD8Sd0QQaIn4LRBUEA5KTNQMwP5YP8AfJTMZSNFcgA8R0gngvE54D4JAMexTAgAMSSQMyDLjEKBh8AAOrWIOjXAi92AAAAAElFTkSuQmCC>

[image26]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAABQCAYAAACksinaAAAELUlEQVR4Xu3dT6guYxwH8EcoQlcRkRIpC+JKKSJrCTdZcbdCyYbYWJBsFMnVTXcnxYJEqetfuVm5lFKkRCKxkI2ipPD79cwwnnPOe+Z9HWO85/Opb+fMMzPn1l19e555ZkoBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACYp4ORQ+0gAAD/vfsjr0Z+jzzbnAMAYEYUNgCAmVPYAABmTmEDAJg5hQ0AYOYUNgCAmVPYAABmTmEDAJg5hQ0AmL18geyBdnCBw5G97eD/UBa1NoobADA7x0TeiuxpTyxwReSzdhAAgJ13WuT9UkvbsvLeJ8tq9wIAMNL+yA/t4BK+j1zUDgIAsHN+itzRDi7hSBcAAFZ0fGRf5JZBrhqc/zVy9eC4d1bk3sj1kWMjt0YOlo3Ln0+VfzZDBwCwa2VRyx2P70TuiXwVeabUwnZpd81J3XiWs6ELIud2v+eOyfw7p0c+ijzQX9S5odTzW7km8kXk6xEBANg1chYsX9OR6WfELo689OcV1cmlLmfmz6HHB7/nPTkLlxsMsrD1Za+Xs3N5fis5O3dGqaVwu2wl/811CgBAebRsnPXKonCkGTulG2sL21CWsbboDV1e6nNw/6ZT1ywAAOVo5JPB8XGRFyJXDsbSVkuiuRya504of3/G7cTImf1FHUuiAAAreDvyweA4S9MvpRa31neR8wfHWcg+LbWI5fg3kXO6c/l3srQN5Q7T35oxAAC2kRsOHoy8WOqS593d2GayyA1f65HX5eaE17p83OXDyLWD63pHIq+3gwAAjJNLnblZYJH3ysZn1HKjQt6XP/tNA/lzM/lKjyyEU8ryeF07CACwrrKM5Qxa+361MbLUPVJWu3dZ+bD+Y5GbSn1mLpdsl/F8mXaH5nOlznDeF3mz1P9nAICV3VhW+7zUnWX7GbydljtaVylsr5S6o3UK+cxfLi3nDGfOPv5Ypi2LAMCayne2HWgHFzgc2dsOTmDKwpbLwA9HDpW6a7aXLxEefjmiz77BNenmUq8FANhVpipsucHi88j+Uu97oyx+X91Qzq5l2cvPduVy8YVl8x26AABraYrCdlnk21I/0dV7N7JncLzI7ZEnSn2BcS4bj70PAGAtjClsuQyZy5PD5crcWZrfQW2XMVs5I/Z05OXI2ZHbSt08sOzyb750OPmyAQCw64wpbJsZO8OWGwXy6w9jrgUAYBNTFbb2c10AAGwjlyqzRF1SamG7qzvulx63M7awpdxokOmdF3mobP21CAAAyl8za23GzrQtU9iymP1c6qe5vowcLdO8HBgAYFeb+ksHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAGfwDxprb4DTomYAAAAABJRU5ErkJggg==>

[image27]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAaCAYAAABYQRdDAAABTklEQVR4Xu2UvytFYRjHH2EQKZEfg7oWRflRMlusNiZ/gMU/YFNmi5nBoAxSBsWmmCgTMlAY/AHKYBCfr/ccvR7HOefeO6n7qU/n3Oc597nnfd7nvWYNcmjCbhzAjijeiu3R51Ko2CG+4wc+4xtWsA03cTF9uAz9uI8HOIbNSVzXSzzGF5xI4oVM4hO+Wnhbz5qFN7/ALpfL5NzCF1Ysu6BQbx+tiqWr4BX2+kSEiurHR3wiiyELRZd9wqGi8xY2q5AlC32c8ola0fyd4I793cuqSYtuu3gWu9iZ3K/HCU8L7lm5oqvJVeOkscpFG3Rk+RtQwcHkXrv/8J3JQUfyHsddfBRPcSGKbVjYg0Jm8M7CaN3iFt7gGQ5Hz6VL18SUQudbS9MszmHfz/QXymtF0z5RDzqi19hjv1tVM+qnpkVTM+tydaHZjv+0G/xHPgGJdzJVXu+TBgAAAABJRU5ErkJggg==>

[image28]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAaCAYAAAA0R0VGAAABrElEQVR4Xu2VzSsFURjGX/kokRL5WKhroygfZSE2NrJjRRaUpY2VnZ3iL7AmWSgLsWWnWFFW3O6CxMIfoCwsfDxPZ47OfZ25907NnVHmV7/mznmnmWfuec8ckYx/SA1sg92w2Rmvh03OeaIw1Bj8gF/wBb7DHGyEO3DRXpwkXfAYfsJBWBuM83gDz+ArHA7GE2MEPsM3OKtqZFPMP3kNW1WtqlyJefC6mGn1wd57khSmlMFuYYcuODAcX6JfF6pJr5hwq7qgYLg5MYsiMVbE9NmoLqQNv1/n8EDCey1u+JxpMQuwJDbcvhr3cQhbnHN+78JoF//L7sFHMW00o2q/qINHUlm4Dec3PyVsBx+855oU7yqWBjHtwzYqG45wIZxK6UbPwR7nnCt23Dl3Yait4OgjUjjCreoBDqnxAXgB59X4tvinjcQebhLei+mFAtyFeXgJ+5zrCKeUu4SFIbmd8TNDl+BJcLRjE8F1JHI4wv2T08WbLcPO4vIPvIb/siWRcJXC7etOTI/qNiCxT2sU2G9c4QtwStVIquFI2INJuXCpwt5iv4at5oyMP8k31FdH/UoSx1kAAAAASUVORK5CYII=>

[image29]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAaCAYAAAAue6XIAAACPUlEQVR4Xu2WP2iUQRDFn6igaBSDRANCUGxEC4NiEwk2AZuYwlK7FLEQCwvtFXtBCwtBLIQY0ogIQSyMFgnYapMuItgpFpH43/ecW1jmdvf2Er6AcD94fNzMZnd2d3YyQI//h93UVm8ssI3a6Y1rQYvuowZRN+Fl6g66C3aImqdOekctm6gF6iv1nvpA/aRG4kEJ3lAD3hjR7w0tTlFLrW9XHKCeUBPU5siuhX5R5yNbzGFqzBtb7KAmqS/e0UKHc5N6AUujKo7DTlInlOIt9ZkadnYtdpva7uziE2yTupk/zhdzELb2Je9I8Qo22UXviBiHjdFm9kR25erH6HeKhygHK85S370xhSZaRPkaQrDLsEcn9Jqfwa6wRE2wh9B50/+uQBPphEpcRXuw+ur3/TAoQ02wfdRr2AFkuQDLxWPe4XiA9jQ4Qa1Q18OgDDXBbqFmqb3eEVD9fEk9gj2UEr9hC56LbCE19C1RE6zQuCPeGAjBalAJbSSV100Eq9tKEh5Ip2A1gUqQr6VNBKtan+UWLOBcYuv0n1PX0J4qp6kfsMdXoptgw+NNEq54GvbfJrAL9ser1JXIHqPH8A6W8zk051PYGrkDEWGujqhsqRdYhp30Y1iBnoGVthzaqKpEbhEFmFIqbUJlqUK7PgMrZfrWdFpC1eGbN66BKVjT1CjqtNQ3rAf1FXPUXe9oAvUUpXTphKqMGpmj3tEUqhi5FjKHcl5V5h66a9rXzX7YosU66RilbmCDA+3RYyP4CwYsdzUYnQr7AAAAAElFTkSuQmCC>