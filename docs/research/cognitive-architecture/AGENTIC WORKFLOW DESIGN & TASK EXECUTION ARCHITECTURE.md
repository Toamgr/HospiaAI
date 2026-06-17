Research archive note: This document is supporting research for HESTIA Cognitive Architecture. It is not canonical product doctrine, current production behavior, or implementation authority. Do not implement it directly without HESTIA's provenance, confidence, role-access, venue-boundary, evidence, and human-approval guardrails. It must not be used to create fake intelligence, fake Venue Memory, fake Venue DNA, fake KPIs, or automatic operational truth.

# **Operationalizing Agency: A Systemic Architecture for Safe, Durable, and Policy-Constrained Task Execution**

## **The Pragmatic Lowering of Conversational Intent to Operational Action**

The evolution of artificial intelligence from conversational interfaces to autonomous execution substrates requires a fundamental shift in how human intent is parsed, validated, and translated1. In classical software engineering, execution boundaries are defined by rigid syntax, typed schemas, and strict access controls3. Conversely, natural language-driven execution operates on non-deterministic, probabilistic inputs2. Moving from understanding to safe action necessitates a compiler-like pipeline that lowers high-level human speech into structured, provable, and policy-constrained operations1.

### **Pragmatic Parsing and Speech Act Theory**

To identify when a conversational input implies an operational action, the system must analyze natural language through the lens of pragmatics and Speech Act Theory5. Under this framework, words are not merely symbolic vectors; they are actions designed to alter the state of the physical or digital environment6. Every utterance operates on three distinct levels simultaneously8:

* **Locution**: The literal, syntactic content of what is said (the literal text)8.  
* **Illocution**: The intended communicative action or pragmatic force behind the words (what is meant)8.  
* **Perlocution**: The actual psychological or operational effect produced in the listener or execution substrate8.

A primary failure of conversational models is a reliance on literal locutionary content, leading to a failure to parse indirect speech acts5. For example, when a user says, "Our storage costs are exceeding the quarterly projection," the locution is a simple representative statement describing a state7. However, the illocutionary force is an indirect directive, implying a request to identify, categorize, or delete redundant data assets5.  
To bridge this gap, the execution pipeline must deploy a semantic parser that classifies utterances into explicit communicative categories5. This parser evaluates context, speaker identity, and operational authority to determine whether the user is expressing an emotion, sharing an abstract concept, or initiating an execution request6.

| Conversational Intent Tier | Pragmatic Category (Searle Taxonomy) | Primary Computational Goal | Verification / Validation Mechanism | Downstream Lifecycle Action |
| :---- | :---- | :---- | :---- | :---- |
| **Idea** | Expressive / Representative6 | Document conceptual brainstorming and contextual assumptions6. | Vector embedding similarity checks against strategic roadmaps. | Appended to a non-active knowledge store; no execution initialized6. |
| **Request** | Information-Seeking5 | Retrieve state parameters from external data sources without modifying system state5. | Input parameter sanitization and read-only schema alignment checks9. | Lowered to a read-only query; execution restricted to non-mutating APIs11. |
| **Intention** | Commissive6 | Log future commitments or conditional triggers for analysis6. | Logical validation of preconditions and trigger events. | Registered in the temporal scheduler as a pending conditional task12. |
| **Decision** | Representative Declarative6 | Assert an authoritative choice that updates the logical process state6. | Multi-agent evaluation consensus and authorization audits14. | State machine transition updated; system state updated to reflect the choice16. |
| **Approved Task** | Directive6 | Execute a specific task with side effects within defined operational boundaries1. | Parameter type validation and strict policy guard evaluations15. | lower parameters to execution substrate via isolated tool calls1. |
| **Recurring Workflow** | Dynamic Policy Directive6 | Run a standardized, multi-step sequence of tasks on a set schedule12. | Compiles to BPMN/CMMN graphs with strict topological validation19. | Registered in a durable scheduler with hard-coded triggers and alerts12. |
| **Strategic Initiative** | Hierarchical Goal Directive6 | Coordinate complex, long-horizon objectives across multiple systems22. | Multi-agent plan generation with cross-agent consistency evaluations14. | Decomposed into a hierarchical tree of dependent subgoals22. |

### **Preventing Premature Execution and Managing Flow-State Approvals**

A major operational hazard in agentic deployment is premature tool execution, where an model interprets a conceptual idea or a tentative plan as a direct command to act25. This risk is amplified because models process trusted user instructions, retrieved data records, and dynamic tool observations within a single context window, which can conflate data flow with execution authority3.  
To prevent premature actions, the architecture must maintain a clear separation of concerns by isolating the *intent generator* (cognition) from the *execution engine* (action)25. The reasoning model is completely air-gapped from execution pathways; it can only propose actions as structured, non-executable JSON payloads25.  
These proposed payloads are intercepted by a deterministic execution engine that checks them against state variables, user permission profiles, and confirmation requirements15. No action containing state-modifying side effects can execute unless the action payload transitions from a proposed state to an authorized state via a deterministic confirmation gate15.  
For high-risk operations, the system must prompt for human approval without disrupting the user's workflow29. This requires a transition from synchronous blocking calls to asynchronous authorization patterns29. Traditional synchronous loops keep active connections open, consuming compute resources and creating conversational bottlenecks while waiting for human input12.  
In contrast, asynchronous authorization decouples the request from the execution loop29. When a high-risk action is proposed, the system saves the execution context, suspends active compute resources, and uses standards like Client-Initiated Backchannel Authentication (CIBA) to dispatch out-of-band notifications to the user's interface12. The user can review the request at their convenience, while the system remains dormant and ready to resume once the signed approval payload is received12.  
To bridge the gap between abstract human directives (e.g., "optimize the database indexes") and concrete executable actions, the system utilizes a compiled lowering process1. This pipeline processes vague instructions through four distinct phases:

[Conversational Input]   
         ג”‚  
         ג–¼  
 1. Pragmatic Extraction ג”€ג”€\> Isolates core verb-object relationships  
         ג”‚  
         ג–¼  
 2. Intermediate Representation (IR) ג”€ג”€\> Compiles to logical Abstract Syntax Tree (AST)  
         ג”‚  
         ג–¼  
 3. Formal Constraints Check ג”€ג”€\> Evaluates AST against static system policies (Z3)  
         ג”‚  
         ג–¼  
 4. Substrate Target Generation ג”€ג”€\> Outputs declarative Directed Acyclic Graph (DAG)

This progressive compilation ensures that vague human directives are converted into verified, schema-aligned instructions before reaching system tools, shielding production environments from unstructured model outputs1.

## **The Functional Anatomy of Executable Tasks**

A fundamental challenge in operational AI is defining what makes a task executable32. Traditional workflow engines rely on deterministic, pre-coded execution paths, while autonomous agents often generate unconstrained tool sequences that are prone to plan drift and safety failures33. To combine the flexibility of generative models with the reliability of enterprise workflows, tasks must be encapsulated as structured, self-documenting data contracts17.  
These contracts synthesize core principles from classical planning systems (PDDL/STRIPS), BPMN process engines, and agentic environments19:

* **Classical Planning Systems**: Require explicit preconditions (the state of the environment required for execution) and post-conditions (the changes applied to the state after execution), enabling formal correctness checks and search-based plan validation37.  
* **Workflow and Process Engines**: Provide explicit definitions for actor permissions, resource boundaries, audit trail logging, and error-handling paths15.  
* **Agentic Frameworks**: Integrate dynamic model-based evaluation, context-aware memory updates, and real-time step adjustments16.

By combining these paradigms, the system models every task instance as an immutable schema containing twelve core operational attributes:

| Operational Attribute | Formal Representation | Core Structural Purpose | Runtime Verification Method |
| :---- | :---- | :---- | :---- |
| **Goal** | Declarative State Logic | Defines the target environmental state as a verifiable assertion, rather than an imperative sequence of instructions42. | Post-condition assertion validation against the environment32. |
| **Owner** | Cryptographic Identity | Links the task to the authenticated human user who initiated the request, establishing the security context2. | OAuth2 / OIDC token signature validation at runtime40. |
| **Scope** | Resource Boundaries | Specifies the authorized system endpoints, databases, file directories, and parameter limits40. | Reference monitor intersection checks against resource allowlists11. |
| **Constraints** | Temporal & Logic Boundaries | Hard constraints (such as execution windows and volume caps) that cannot be altered by model reasoning15. | Pre-execution checking of parameters using static logic analyzers15. |
| **Required Inputs** | Strongly Typed Schemas | Specifies the input parameters, complete with strict type and validation schemas (e.g., Pydantic)17. | JSON Schema validation before the tool is invoked17. |
| **Dependencies** | Topological Graph Nodes | Identifies precursor tasks or events that must complete successfully before this task can start40. | Direct check of dependency states within the workflow database40. |
| **Risk Level** | Categorized Risk Tier | Computes the potential risk of an action (Negligible, Low, Medium, High, Critical) based on affected resources33. | Matrix lookup combining tool risk classification and parameter values46. |
| **Approval Level** | Authorization Rules | Specifies the required human review gate (Auto-execute, Peer-review, VP Approval) for the computed risk level15. | Cryptographic verification of approval signatures10. |
| **Success Criteria** | Semantic & Logic Assertions | A set of testable assertions that confirm the goal state was reached, preventing the system from mistaking tool completion for task success42. | Execution of verification tools (e.g., automated test suites or post-state queries)41. |
| **Deadline** | Absolute Epoch Timestamp | Specifies the time limit after which the task is marked as timed out, preventing stuck tasks47. | System-level scheduler monitoring and cron alerts12. |
| **Memory Impact** | Taint & Variable Labels | Tagging variables read during the task with security classifications (e.g., PII, Financial) to control downstream data flow1. | Transitive taint-tracking across the execution provenance graph11. |
| **Audit Trail** | Write-Once Data Store | An append-only log record detailing the execution context, tool parameters, results, and approval events15. | Cryptographic hash chaining on database write operations10. |

## **The Comparative Topology of Agentic Workflow Patterns**

Selecting the appropriate execution topology is a critical factor in ensuring system reliability and safety17. As workflows transition from linear chains to multi-agent architectures, they trade off execution flexibility for governance control16.

Linear Topologies:  
  [Single-Agent Execution] ג”€ג”€\> Straightforward path; minimal overhead but high risk of plan drift [cite: 16, 33].  
  [Checklist Workflows] ג”€ג”€\> Highly deterministic; zero flexibility; halts on any unexpected deviation.

Cyclic Topologies:  
  [State Machines] ג”€ג”€\> Controlled loops; explicit state transitions; ideal for iterative verification.  
  [Autonomous Agents] ג”€ג”€\> Free-form execution; dynamically explores state spaces; high security risk [cite: 4, 33, 48].

To establish an appropriate architectural baseline, the table below compares nine common execution topologies across five key operational dimensions:

| Execution Pattern | Strengths | Weaknesses | Primary Failure Modes | Best Use Cases | Governance Requirements |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Single-Agent Execution** | Low latency; minimal token overhead; simple to deploy and debug for single-step tasks16. | Vulnerable to plan drift, context window overflow, and reasoning loops on complex, long-horizon tasks33. | Infinite loop execution; hallucinating parameters; susceptibility to prompt injection9. | Isolated, low-risk data parsing tasks with strict formatting schemas40. | Input sanitization; real-time execution timeout limits; strict tool allowlists9. |
| **Planner / Executor Systems** | Separates tactical tool calls from high-level strategy; improves execution stability on multi-step tasks40. | High initial planning latency; the executor cannot dynamically alter the strategic plan when encountering novel anomalies53. | Epistemic miscalibration where the generated plan is internally consistent but practically infeasible14. | Complex multi-hop queries or multi-source data synthesis workflows23. | Pre-execution plan validation against hard static schemas and security policies11. |
| **Supervisor-Worker Agents** | Clear hierarchy; worker agents are isolated and specialized, preventing context contamination16. | High token consumption; supervisor acts as a single point of failure and coordination bottleneck12. | Supervisor misrouting workers; worker fatigue where sub-tasks fail repeatedly without escalation16. | Complex software engineering pipelines or multi-source content generation40. | Inter-agent message signing; independent monitoring of supervisor routing logic10. |
| **Checklist-Based Workflows** | High determinism; easily audited; guarantees compliance with standard operating procedures16. | Zero adaptability; unable to navigate unexpected edge cases or handle unstructured anomalies17. | Workflow halt when encountering any unstructured response outside the schema. | Regulatory compliance checks; standardized system provisioning15. | Explicit manual override pathways for exception-handling processes18. |
| **State Machines (LangGraph)** | Cyclic graph support; explicit state validation; native checkpointing allows state inspection and rollback16. | Complex code structure; graph complexity scales exponentially with dynamic branching and edge cases51. | Format validation failures on conditional edge state mutations17. | Interactive applications requiring tight reasoning loops and human-in-the-loop review4. | Strict schema validation (Pydantic) on state mutations17. |
| **Workflow Orchestration (Temporal)** | General-purpose durable execution; workflows can sleep for days and survive process crashes30. | High platform complexity; requires dedicated worker infrastructure and adherence to strict determinism13. | Non-deterministic code errors during workflow replay; network timeout misconfigurations13. | High-stakes, long-running processes involving external system integrations and multi-day approval gates30. | Comprehensive distributed tracing and policy checks integrated into activity execution10. |
| **Human Approval Gates** | Maximum risk mitigation; ensures critical decisions are verified by qualified personnel33. | Introduces significant latency; relies on human attention, introducing cognitive load and bottleneck risks10. | Human fatigue leading to blind approval of incorrect or unsafe action parameters10. | Financial transactions; database state drops; deployment of external communication campaigns30. | Dynamic risk calculations; clear presentation of plan parameters and safety risks to reviewers10. |
| **Autonomous Agents** | Maximum flexibility; capable of navigating open-ended environments to achieve abstract goals4. | Highly unpredictable; prone to goal drift and high execution costs33. | Unauthorized privilege escalation; runaway tool execution causing financial or resource depletion48. | Highly exploratory tasks, such as automated vulnerability discovery in sandboxed networks40. | Strict sandboxing (OS-level isolation); hard caps on operational duration and token budgets48. |
| **Semi-Autonomous Agents** | Balance of flexibility and control; actions are suggested by the model but mediated by gates18. | Requires a highly integrated user experience to manage the frequency of authorization requests40. | Silent approval of unsafe paths; friction-heavy interfaces leading to manual bypasses of security protocols40. | Operations management; collaborative content creation; localized code-generation assistants31. | Least-privilege role boundaries inherited directly from the logged-in user10. |

## **Durable Monitoring, State Drift, and Epistemic Calibration**

Monitoring an agentic execution system requires tracking more than standard system health metrics. While classical monitoring tools focus on system metrics like CPU usage, memory allocation, and database latency58, an operational AI execution monitor must track the logical progression of the task, verify plan feasibility, and identify when reasoning context drifts from physical reality14.

### **State Progress and Blocker Detection**

The monitoring framework models execution as a state transition path on a Directed Acyclic Graph, mapping every tool call, input-output pairing, and intermediate assertion to a structured provenance graph ![][image1]11.

[State A] ג”€ג”€\> Tool Call (f) ג”€ג”€\> Observed Environment State (S_obs)  
                                         ג”‚  
                                         ג–¼  
                     Is S_obs within expected post-conditions?  
                               ג”ג”€ג”€ Yes ג”€ג”€\> [State B] (Continue)  
                               ג””ג”€ג”€ No  ג”€ג”€\> Plan Invalidation: TRIGGER RECOVERY

To calculate state drift, the system monitors the environmental variables after each tool execution18. If the observed variables diverge from the plan's expected post-conditions, the monitoring layer flags an anomaly18.  
Blockers are classified into three core types to streamline recovery:

* **Infrastructure Blockers**: Rate limits, network timeouts, or service outages that are transient in nature13.  
* **Syntactic Blockers**: API changes, malformed tool outputs, or schema mismatches that prevent downstream compilation17.  
* **Semantic Blockers**: Unmet logical preconditions (e.g., trying to reallocate budget from an empty account), indicating that the current plan is deadlocked34.

### **Epistemic Miscalibration in Multi-Agent Planning**

A common point of failure in complex planning systems is *epistemic miscalibration*14. This occurs when a planning agent assigns high confidence to its plan's feasibility, failing to recognize the limits of its knowledge14. The generated plan remains structurally consistent and execution proceeds without syntax errors, yet the system repeatedly runs valid actions without satisfying the actual goal14.  
To detect and mitigate epistemic miscalibration, the monitoring framework implements the Epistemic Planning Calibration Agentic Workflow (EPC-AW)14. The system uses Information-consistency-based Plan Selection (IPS) to run peer evaluations before executing a plan14.  
At step ![][image2], the planning agent ![][image3] generates a set of structurally distinct candidate plans ![][image4] based on system-level memory ![][image5] and its private information state ![][image6]14:  
![][image7]  
Rather than relying on the planner's confidence, multiple evaluator agents with heterogeneous information states assess the candidate plans14. Each evaluator agent ![][image8] predicts how peer agent ![][image9] would score plan ![][image10] under alternative information states ![][image11], mapping these to predicted evaluation scores14:  
![][image12]  
These predictions are averaged to compute a peer-based expected stability metric14:  
![][image13]  
Plans with high variance across evaluators are flagged as epistemically fragile and rejected, while plans showing stable support are cleared for execution14.  
Across execution runs, Consistency-guided Epistemic State Refinement (CESR) logs discrepancies between the planner's selected strategies and the IPS-selected plans14. This comparison serves as a diagnostic tool, refining the system's memory to help prevent future misjudgments14.

### **Control Loop Decision Matrix**

When an execution error is intercepted by the monitoring layer, the system evaluates the failure type against a deterministic transition matrix to select the safest recovery path:

| Error Classification | Primary Root Cause | Critical Indicator | Control Loop Decision | Execution Action |
| :---- | :---- | :---- | :---- | :---- |
| **Transient Error** | Network timeout; rate limit; temporary API downtime13. | Standard HTTP 429/503; socket timeouts13. | **Retry** | Re-run the activity using exponential backoff and jitter13. |
| **Data Format Error** | Unexpected tool response schema; malformed JSON re[citation artifact removed]. | Schema validation exception17. | **Revise** | Send the malformed payload back to a dedicated parsing node to re-compile the plan17. |
| **Epistemic Fragility** | Plan invalidation due to discovered knowledge gaps14. | Evaluator variance threshold breached14. | **Replan** | Terminate the plan, update the memory context, and generate a new plan14. |
| **Boundary Violation** | Attempt to access resource outside scope or run prohibited action26. | Policy guard interception event15. | **Escalate** | Pause execution, lock the workflow, and request human override15. |
| **Systemic Failure** | Non-recoverable error; cascading step failures34. | Hard constraint violation48. | **Stop & Rollback** | Terminate the task and execute saga-style compensating actions13. |

### **Failure Recovery and Post-Mortem Learning**

To prevent the recurrence of execution failures, the system implements an automated feedback loop. When a task is stopped or escalated, a diagnostic agent analyzes the execution provenance graph, state transitions, and environmental logs11. This agent generates a structured post-mortem document identifying the failure's root cause (e.g., an outdated database schema or an unhandled API response format)11.  
This diagnostic post-mortem is embedded and stored in the agent's long-term episodic memory23. When future plans are generated, the system queries this episodic memory to inject concrete execution constraints and historical avoidance patterns directly into the planner's system prompt, facilitating continuous learning and performance refinement23.

## **Safe Action Boundaries and Containment Tiers**

Operating an AI execution system requires defining clear boundaries on what actions can be automated32. These boundaries are calculated by mapping the risk of an action across financial, legal, reputational, and operational dimensions against four containment levels10.  
The system models containment across four tiers:

* **Perform Automatically**: Low-risk, idempotent, or read-only actions that can execute end-to-end without human intervention33.  
* **Prepare for Review**: Actions that are fully assembled and validated by the agent, but pause at a runtime approval gate to await human verification before execution30.  
* **Recommend Only**: High-risk, strategic actions where the agent is restricted to generating alternative scenarios and providing analytical comparisons33.  
* **Never Perform (Prohibited)**: Critical operations that are entirely barred from agent involvement to protect the integrity of the organization15.

| Operational Domain | Perform Automatically | Prepare for Review | Recommend Only | Never Perform (Prohibited) |
| :---- | :---- | :---- | :---- | :---- |
| **People** | Fetching public calendar availability; generating standard shifts12. | Distributing policy updates; updating directory contact information. | Generating performance review drafts; suggesting candidate shortlists26. | Executing automated employee terminations or disciplinary actions. |
| **Money** | Processing approved expense reports under $100; cataloging ledger balances. | Departmental budget reallocations; executing invoices over established thresholds15. | Long-term capital expenditure planning; corporate acquisition pricing. | Direct access to primary banking credentials or high-value fund transfers15. |
| **Reputation** | Formatting internal newsletters; compiling public press summaries. | Generating standard social media posts or press draft releases4. | Creating crisis management communications; public response strategies. | Directly publishing un-reviewed customer-facing announcements. |
| **Legal Risk** | Compiling regulatory changes; identifying outdated clauses in standard templates. | Generating non-binding agreement drafts using pre-approved templates. | Interpreting high-stakes compliance rules; analyzing liability exposures. | Executing legally binding signatures or resolving regulatory disputes. |
| **Privacy** | Redacting PII from local system logs; encrypting data in-transit. | Processing user data deletion requests (GDPR/CCPA validation). | Designing database access controls or auditing tenant separation rules. | Exfiltrating credentials or unencrypted .env files to external API logs26. |
| **Safety** | Running unit tests in localized containers; security log parsing40. | Triggering non-critical security updates; isolating flagged testing subnets. | Reconfiguring production firewalls; overriding physical safety limits18. | Overriding high-voltage, physical, or life-support system safety overrides18. |
| **Public Communication** | Synthesizing product documentation; formatting public-facing support FAQs. | Drafting replies for verified support queues; generating product updates30. | Defining corporate brand guidelines; planning global media campaigns. | Directly posting live responses on public-facing social media channels. |
| **Employee Evaluation** | Logging shift completion times; tracking project delivery statuses. | Compiling objective performance metrics; formatting review templates. | Synthesizing manager feedback; suggesting compensation adjustments. | Automating salary decreases or finalizing employee performance ratings. |
| **Operational Changes** | Restarting dead container nodes; scaling compute instances on traffic spikes30. | Deploying production software releases; updating standard database indexes. | Planning server migrations; selecting primary enterprise software providers26. | Direct execution of unparameterized database drops on production9. |
| **Strategic Decisions** | Formatting quarterly financial summaries; tracking competitor actions. | Modeling alternative resource allocations based on budget parameters. | Advising on product pivot strategies or geographical market expansions. | Defining corporate mission statements or restructuring enterprise targets. |

## **Operational Workflow Memory, Lineage, and Reference Monitors**

For an execution system to be trackable, auditable, and compliant with regulatory standards like the EU AI Act, it must deploy a structured workflow memory15. Every action must produce an immutable record of its context, decisions, and outcomes15.

### **Enterprise Memory Tier Taxonomy**

To optimize both execution performance and safety, system memory is organized into four distinct tiers, separating short-term context from long-term audit logs:

| Memory Tier | Physical Storage Technology | Core Computational Purpose | Retrospective Lifecycle | Data Persistence Guarantee |
| :---- | :---- | :---- | :---- | :---- |
| **Short-Term Context** | Redis In-Memory Structures33 | Maintains the active conversation history and intermediate execution variables20. | Session lifetime; cleared after the current turn or task is complete33. | Volatile; optimized for low-latency read/write access33. |
| **State Checkpoints** | Relational Database (PostgreSQL)33 | Durably preserves snapshots of the state machine after node transitions4. | Preserved across process crashes, restarts, and waiting periods12. | Highly durable; transactional ACID compliance33. |
| **Episodic Memory** | Vector Database (e.g., pgvector)33 | Stores semantic embeddings of past execution post-mortems and plans23. | Queried during planning to guide decisions based on past successes/failures23. | Persistent; optimized for semantic search and retrieval10. |
| **Audit Log & Provenance** | Immutable, Append-Only Storage15 | Records the provenance graph, inputs, outputs, and approval events11. | Retained indefinitely to satisfy compliance and security audits15. | Write-Once-Read-Many (WORM); cryptographic hash chaining10. |

### **Information Flow Integrity and Taint Tracking**

To defend against indirect prompt injection, where malicious instructions are embedded in untrusted external data (such as emails or documents), the memory system must enforce *Data Flow Integrity*1. The architecture deploys an **Agentic Reference Monitor (ARM)** at the boundary between the reasoning layer and the execution substrate44.

                     [Agentic Reference Monitor (ARM) Pipeline]  
                                         ג”‚  
                                         ג–¼  
                 Data read from Untrusted Retrieval Tool (T_U)  
                                         ג”‚  
                                         ג–¼  
                    Apply Taint Tag (T_PII / T_UNTRUSTED)  
                                         ג”‚  
                                         ג–¼  
                      Transitive Data Propagation  
                 (Taint tag flows with parameters into variables)  
                                         ג”‚  
                                         ג–¼  
                Attempt to invoke Privileged Action Tool (T_A)  
                                         ג”‚  
                    Does the argument carry a taint tag?  
                               ג”ג”€ג”€ Yes ג”€ג”€\> BLOCK & ESCALATE [cite: 1, 44]  
                               ג””ג”€ג”€ No  ג”€ג”€\> ALLOW & EXECUTE [cite: 15, 44]

Under this pattern, any data retrieved from an untrusted source is tagged as *tainted*1. This taint tag is bound to the variable memory and propagates transitively through downstream transformations44.  
When the agent attempts to invoke an action tool, the reference monitor inspects the argument's lineage within the provenance graph11. If a parameter contains tainted data without an explicit authorization override, the monitor blocks the action, preventing unauthorized data exfiltration1.

### **Mitigating Causality Laundering**

Traditional flat taint tracking can be bypassed by *causality laundering*, where an attacker uses conditional execution feedback to leak data without directly passing variables44. For example, a malicious payload might cause the agent to attempt a restricted action; if the action is blocked, the agent executes a benign-looking call to a public API, allowing the attacker to infer database parameters based on the denial outcome44.  
To block these implicit flows, the ARM treats blocked and denied actions as first-class nodes within the provenance graph44:  
![][image14]  
Where the node set ![][image15] is partitioned to explicitly include a subset for denied actions44:  
![][image16]  
When an action is blocked, the ARM records the event as a DeniedAction node and introduces counterfactual causal edges to subsequent execution branches44. These counterfactual edges propagate the security context of the denial down the execution path, allowing the reference monitor to block downstream leak vectors44.

## **Architectural Blueprints for the Ten Required Frameworks**

Implementing safe operational execution requires coordinating ten specific frameworks, each serving a distinct purpose in the intent-to-execution pipeline1.

### **1. Conversation-to-Action Framework**

The Conversation-to-Action Framework parses conversational user inputs to identify action-oriented intent and safely transition dialogue into the task lifecycle5.

| Dimension | Specification Details |
| :---- | :---- |
| **Purpose** | Orchestrates the pragmatic parsing of human natural language utterances to determine whether an operational action has been explicitly or implicitly requested5. |
| **Inputs** | raw_user_message: String (Conversational input); dialogue_context: List of historical messages; user_authorization_context: User identity and permission profiles10. |
| **Outputs** | is_actionable: Boolean (Action indicator); pragmatic_force: Enum [Representative, Directive, Commissive, Expressive, Declarative]6; target_action_schema: JSON action proposal1. |
| **Risks** | Misinterpreting an abstract idea or conversational venting as a command, leading to unauthorized tool execution7. |
| **Failure Modes** | *Literal Bias*: Treating a warning (e.g., "The server is running out of memory") as chat instead of a directive to run cleanup tools5; *Adversarial Injections*1. |
| **Human Approval Requirements** | Any input parsed as a high-risk directive must trigger a confirmation showing the generated plan before tools run15. |
| **Recommended Patterns** | Implement an offline classification layer that evaluates the speech act before passing the context to the reasoning engine8. |

### **2. Task Classification Framework**

The Task Classification Framework evaluates proposed action payloads to calculate risk levels and map them to appropriate approval levels15.

| Dimension | Specification Details |
| :---- | :---- |
| **Purpose** | Evaluates proposed tasks to calculate their risk tier and determine the required approval gate before tool execution15. |
| **Inputs** | proposed_task_payload: JSON (Generated tool calls and variables)1; resource_registry: Operational classification of targeted endpoints10. |
| **Outputs** | risk_score: Float (![][image17] to ![][image18]); risk_tier: Enum [Negligible, Low, Medium, High, Critical]33; required_approval_gate: Enum [AutoExecute, Peer, VPApproval]10. |
| **Risks** | Underestimating risk due to model hallucination of the argument values, allowing sensitive actions to bypass human gates26. |
| **Failure Modes** | *Parameter Camouflage*: Masking high-risk database drop statements inside seemingly benign parameterized query strings9; *Role Confusion*26. |
| **Human Approval Requirements** | The matrix mapping risk tiers to approval gates is hard-coded and mathematically verified15; it cannot be modified by model reasoning27. |
| **Recommended Patterns** | Compile policies using the Chimera Specification Language (CSL) and run the Z3 theorem prover locally to verify that parameters do not violate boundaries15. |

### **3. Executable Task Model**

The Executable Task Model encapsulates the goal, scope, dependencies, constraints, and success criteria into a typed object that serves as the single source of truth17.

| Dimension | Specification Details |
| :---- | :---- |
| **Purpose** | Encapsulates the goal, scope, dependencies, constraints, and success criteria into a typed object that acts as the single source of truth during execution17. |
| **Inputs** | target_goal_state: Declarative assertions42; owner_id: Authenticated user UUID2; input_parameters: Strongly typed structures17. |
| **Outputs** | executable_task_instance: Immutable task object conforming to the enterprise task schema. |
| **Risks** | Initializing a task with undefined boundaries or conflicting constraints, causing the downstream execution engine to crash15. |
| **Failure Modes** | *Schema Violation*: Attempting to pass unstructured JSON values into strictly typed input fields17; *Circular Dependencies*40. |
| **Human Approval Requirements** | Changes to the core task schema are restricted to platform administrators and managed via standard pull request workflows16. |
| **Recommended Patterns** | Define task contracts using strictly typed Pydantic models with custom validators that run pre-execution checks on variables17. |

### **4. Agentic Workflow Framework**

The Agentic Workflow Framework manages coordination, routing, and message passing between multiple specialized agents16.

| Dimension | Specification Details |
| :---- | :---- |
| **Purpose** | Manages the coordination, routing, and message passing between multiple specialized agents to achieve complex, multi-stage goals16. |
| **Inputs** | validated_task_model: Task instance; agent_team_registry: List of specialized agents and their associated tools40. |
| **Outputs** | agentic_interaction_trace: Step-by-step log of agent conversations, state transitions, and intermediate outputs16. |
| **Risks** | Inter-agent communication breakdowns, where incorrect assumptions lead to task drift or miscoordinated execution14. |
| **Failure Modes** | *Coordination Deficit*: Agents assigning contradictory sub-tasks to each other; *Shared Memory Poisoning*48. |
| **Human Approval Requirements** | Inter-agent routing rules must be explicitly designed and mapped in code; agents cannot autonomously provision new agents with execution privileges16. |
| **Recommended Patterns** | Model the workflow as a state machine using LangGraph4. Use separate context windows for each worker to maintain context boundaries17. |

### **5. Planning and Execution Framework**

The Planning and Execution Framework decomposes high-level goals into sequential or parallel execution branches, evaluates plan feasibility, and triggers tool execution22.

| Dimension | Specification Details |
| :---- | :---- |
| **Purpose** | Decomposes high-level goals into sequential or parallel execution branches, evaluates plan feasibility, and triggers tool execution22. |
| **Inputs** | executable_task: The validated task; operational_context: Real-time system status and history22. |
| **Outputs** | compiled_execution_dag: The Directed Acyclic Graph of tool calls16; execution_results: The state returned after tool execution32. |
| **Risks** | Generating plans based on miscalibrated feasibility assessments, leading to correct execution of steps that fail to satisfy the overall objective14. |
| **Failure Modes** | *Epistemic Blindness*: Generating a plan that relies on tools the system assumes are functional but are actually deprecated14; *Step-order Violations*65. |
| **Human Approval Requirements** | Any plan whose computed step count or execution duration exceeds enterprise limits must be paused for human review before tools are run46. |
| **Recommended Patterns** | For stable, data-centric operations, leverage Full-Horizon (FH) planning with lazy replanning to minimize token consumption while retaining robust error-recovery handlers53. |

### **6. Approval Gate Framework**

The Approval Gate Framework suspends execution and manages out-of-band authorization requests, releasing active compute resources while waiting29.

| Dimension | Specification Details |
| :---- | :---- |
| **Purpose** | Manages out-of-band authorization requests, blocking execution until verification is confirmed by the appropriate human principal29. |
| **Inputs** | pending_action_context: Proposed tool call and associated risk analysis33; approval_policy: Explicit role and consensus requirements10. |
| **Outputs** | authorization_token: Cryptographically signed approval receipt40; gate_decision: Enum [APPROVED, REJECTED, ESCALATED]. |
| **Risks** | Human review fatigue leading to accidental authorization of critical vulnerabilities10. |
| **Failure Modes** | *Approval Bypass*: Rogue execution pathways running tools without routing through the gate; *Stale Credentials*40. |
| **Human Approval Requirements** | This framework acts as the human interface; every state transition must be authenticated and logged with non-repudiation guarantees10. |
| **Recommended Patterns** | Deploy Azure Durable Functions or Temporal to handle waiting states30. Use the wait_for_external_event pattern to suspend execution and release compute resources30. Sign approvals using asymmetric cryptography40. |

### **7. Execution Monitoring Framework**

The Execution Monitoring Framework continuously verifies state progress, tracks data dependencies, and detects loops or plan invalidation14.

| Dimension | Specification Details |
| :---- | :---- |
| **Purpose** | Continuously monitors the execution of active tasks to trace progress, analyze data dependencies, detect loops, and identify plan invalidity14. |
| **Inputs** | active_execution_trace: Tool calls, inputs, and outputs11; expected_state_post_conditions: The target state variables18. |
| **Outputs** | observability_telemetry: Real-time trace telemetry10; monitoring_status: Enum [HEALTHY, LOOPING, STALE, COMPROMISED]. |
| **Risks** | Failing to detect a logical execution loop in real time, causing resource exhaustion or unexpected API costs48. |
| **Failure Modes** | *Silent Failure*: A tool returns a 200 OK status code but fails to update the target resource, going undetected by simple log monitors42; *State Drift*18. |
| **Human Approval Requirements** | When a task's status transitions to COMPROMISED or LOOPING, the framework overrides execution, pauses the system, and escalates to a human operator15. |
| **Recommended Patterns** | Build an independent Execution Watcher process in a dedicated runtime container18. Configure it to intercept all tool responses, check post-conditions, and compute semantic loop limits18. |

### **8. Failure Recovery Framework**

The Failure Recovery Framework manages automated retries, dynamic replanning, and reverse-order compensations to resolve partial task completions13.

| Dimension | Specification Details |
| :---- | :---- |
| **Purpose** | Manages automated retries, dynamic replanning, and reverse-order compensations to resolve partial task completions safely13. |
| **Inputs** | failed_task_context: Execution state and target goal62; observed_exception_metadata: Error codes and tracebacks13. |
| **Outputs** | recovery_action_sequence: Execution steps to recover or rollback the system18. |
| **Risks** | Running incorrect compensating actions that worsen system damage after a partial execution failure34. |
| **Failure Modes** | *Compensator Crash*: The cancellation tool (e.g., refund_payment) fails to execute, leaving the system in an inconsistent state34; *Idempotency Break*34. |
| **Human Approval Requirements** | Any critical or high-risk rollback sequence must be approved by an operator if the primary compensation routine fails10. |
| **Recommended Patterns** | Implement the Saga Pattern to coordinate complex, distributed transactions13. Bind every state-modifying tool to a registered compensating action34. Enforce the use of unique idempotency keys for every outbound tool request34. |

### **9. Workflow Memory Framework**

The Workflow Memory Framework isolates short-term variables, manages persistent checkpoints, and maintains long-term episodic and provenance records11.

| Dimension | Specification Details |
| :---- | :---- |
| **Purpose** | Manages short-term conversation context, persistent state checkpoints, long-term episodic memory, and the execution provenance graph11. |
| **Inputs** | runtime_execution_events: Every user input, reasoning block, tool call, response, and decision11. |
| **Outputs** | durable_state_checkpoints: Snapshots of the system state4; immutable_provenance_graph: W3C PROV-DM structured representation59. |
| **Risks** | Cross-session memory leaks, where sensitive variables (e.g., credentials) are exposed to unauthorized users1. |
| **Failure Modes** | *Namespace Poisoning*: Unsegregated memory layers allowing data from one user profile to leak into another's reasoning context48; *Context Overload*26. |
| **Human Approval Requirements** | Accessing or updating long-term episodic memory structures requires explicit system permission and is audited continuously10. |
| **Recommended Patterns** | Store short-term variables in-memory using Redis, save state checkpoints in a PostgreSQL database33, and trace dependencies in an append-only graph database44. |

### **10. Safe Operational Execution Architecture**

The Safe Operational Execution Architecture serves as the core runtime infrastructure, coordinating all frameworks and managing isolated tool execution18.

| Dimension | Specification Details |
| :---- | :---- |
| **Purpose** | Serves as the core runtime infrastructure, coordinating all frameworks, enforcing static policies, and managing sandboxed execution18. |
| **Inputs** | compiled_execution_instructions: The final sequence of tool calls. |
| **Outputs** | state_modification_results: The final outcomes of system execution. |
| **Risks** | Sandbox escapes or host-level security compromises caused by executing untrusted or malicious model code48. |
| **Failure Modes** | *Privilege Creep*: An agent gaining elevated administrative access by exploiting API vulnerabilities or session hijacking40; *Host System Starvation*48. |
| **Human Approval Requirements** | Modifying safe action boundaries or safe/prohibited tool registries requires VP-level human approval10. |
| **Recommended Patterns** | Separate the runtime into four distinct strata18. Isolate all tool execution in secure, single-tenant sandboxes40. Implement rigid resource limits to manage CPU, memory, and runtime duration48. |

## **Recommended Execution Architecture**

To establish a production-grade execution substrate that safely and durably transitions understanding into operational action, a **Two-Layer Durable-Cognitive Architecture** is recommended13. This system design is built on first principles to address the core challenges of reliability, security, and predictability16.  
The architecture separates the reasoning loops of generative models from the state preservation and execution logic of the system13. This separation is implemented by grouping the architectural strata into two primary layers13:

ג”ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”  
ג”‚ 1. COGNITIVE STATE LAYER (LangGraph State Machine)                     ג”‚  
ג”‚    ג€¢ Goal interpretation, episodic memory, plan candidate generation   ג”‚ [cite: 14, 18]  
ג””ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”˜  
                                    ג”‚  
                                    ג–¼  (Structured Action Proposals)  
ג”ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”  
ג”‚ 2. RUNTIME GOVERNANCE INTERCEPTOR (Stratum 3 Policy Guards)            ג”‚  
ג”‚    ג€¢ Capability Admission: Schema validation & type checking ג”‚  
ג”‚    ג€¢ Policy Guard: Deterministic rule verification via Z3ג”‚  
ג”‚    ג€¢ Execution Watcher: Taint-tracking & counterfactual causal analysis ג”‚ [cite: 18, 44]  
ג””ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”˜  
                                    ג”‚  
                                    ג–¼  (Authorized Actions Only)  
ג”ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”  
ג”‚ 3. DURABLE EXECUTION SUBSTRATE (Temporal Orchestration Engine)         ג”‚  
ג”‚    ג€¢ Idempotent task execution via isolated sandboxed activitiesג”‚  
ג”‚    ג€¢ Replay-safe state preservation, signaling, & out-of-band approvalsג”‚  
ג””ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”˜

### **Architectural Justifications from Seven Perspectives**

To evaluate the robustness of this architecture, its components are analyzed below through seven distinct professional lenses, demonstrating how the system design satisfies operational and safety requirements27:

#### **1. The Enterprise AI Architect**

From an enterprise perspective, a primary risk is architectural lock-in to volatile foundational model APIs67. The proposed architecture treats the model strictly as an exchangeable cognitive utility within Stratum 118.  
The orchestrator utilizes standard OpenTelemetry and W3C PROV-DM structures to record a complete trace of every model decision, parameter translation, and tool invocation59. This design creates a consistent compliance record across the organization, independent of the underlying model provider67.

#### **2. The Operations Manager**

Operational success is measured by process predictability, visibility, and minimizing unplanned downtime21. Traditional agent frameworks are prone to silent failures, where a tool call crashes and the agent attempts to improvisedly correct itself, consuming tokens and introducing state inconsistencies42.  
By offloading execution to Temporal, operations managers gain access to real-time execution dashboards, predictable timeout behaviors, and centralized queue management13. If an API endpoint fails, the system halts predictable operations and generates structured alerts, preventing automated thrashing13.

#### **3. The Workflow Systems Architect**

A fundamental lesson from legacy workflow systems (such as Windows Workflow Foundation and BPEL) is that long-running operations must support dynamic sleeping and state replay34.  
The proposed architecture implements these lessons by wrapping every state mutation inside a Temporal Activity13. Temporal intercepts all external calls and persists their inputs, outputs, and intermediate states13. This ensures that workflows can survive container recycles, cloud migrations, and network disconnects without losing state data30.

#### **4. The Human-in-the-Loop AI Researcher**

A critical challenge in human-in-the-loop automation is reducing the cognitive load on the human reviewer10. If the system prompts for approval on every minor step, the reviewer experiences fatigue, leading to accidental authorizations of unsafe operations10.  
The architecture addresses this by implementing confidence-based escalation thresholds and asynchronous out-of-band approvals29. The system packages the execution history, proposed plan, and risk metrics into a standardized review queue, allowing the human principal to verify and authorize actions asynchronously12.

#### **5. The Safety Engineer**

To satisfy compliance frameworks (such as the EU AI Act and NIST RMF), safety properties must be enforced deterministically at runtime15.  
The architecture addresses this by placing the Runtime Governance Layer (Stratum 3\) between agent cognition and tool execution18. This layer evaluates proposed action payloads using deterministic YAML policies and a Z3 solver, mathematically guaranteeing that no model can bypass boundary constraints (such as spending limits or access rules) through prompt injection or plan drift15.

#### **6. The Decision Scientist**

Decision science requires that all choices be traceable and evaluable against optimal alternatives32.  
The implementation of EPC-AW within the state machine addresses *epistemic miscalibration* by forcing the system to evaluate plan feasibility across multiple simulated information states before initiating execution14. The system calculates the variance of these evaluations; if a plan is found to be epistemically fragile, it is rejected14. This pre-execution verification step significantly improves the system-level task success rate while minimizing execution costs42.

#### **7. The Agentic AI Systems Designer**

For system designers, the primary goal is ensuring that specialized agents can cooperate effectively without corrupting shared resources16.  
The architecture manages this by enforcing strict process and session isolation at the OS level48. Specialized worker agents run in isolated sandboxes, communicating via structured, signed messages10.  
Memory access is managed through tiered, namespaced storage, preventing shared memory poisoning and ensuring that data flow constraints are maintained across the lifecycle33.  
This **Two-Layer Durable-Cognitive Architecture** avoids the instability of unconstrained agents by anchoring execution to durable infrastructure13. Decoupling reasoning from execution and safety enforcement ensures that the resulting system is reliable, secure, and compliant with enterprise standards15.

#### **׳¢׳‘׳•׳“׳•׳× ׳©׳¦׳•׳˜׳˜׳•**

1. Securing LLM Agents Need Intent-to-Execution Integrity \- arXiv, [https://arxiv.org/html/2605.16976v1](https://arxiv.org/html/2605.16976v1)  
2. Securing LLM Agents Need Intent-to-Execution Integrity \- arXiv, [https://arxiv.org/pdf/2605.16976](https://arxiv.org/pdf/2605.16976)  
3. AgentSecBench: Measuring Prompt Injection, Privacy Leakage, and Tool-Use Integrity in LLM Agents \- ResearchGate, [https://www.researchgate.net/publication/405317868_AgentSecBench_Measuring_Prompt_Injection_Privacy_Leakage_and_Tool-Use_Integrity_in_LLM_Agents](https://www.researchgate.net/publication/405317868_AgentSecBench_Measuring_Prompt_Injection_Privacy_Leakage_and_Tool-Use_Integrity_in_LLM_Agents)  
4. Building Human-In-The-Loop Agentic Workflows | Towards Data Science, [https://towardsdatascience.com/building-human-in-the-loop-agentic-workflows/](https://towardsdatascience.com/building-human-in-the-loop-agentic-workflows/)  
5. Implicature-Aware Prompting Improves User Evaluations of LLM Responses \- arXiv, [https://arxiv.org/html/2510.25426v2](https://arxiv.org/html/2510.25426v2)  
6. Empirical Evaluation of Automatic Speech Act Classification: From Logistic Regression to GPT-4o \- ResearchGate, [https://www.researchgate.net/publication/400240400_Empirical_Evaluation_of_Automatic_Speech_Act_Classification_From_Logistic_Regression_to_GPT-4o](https://www.researchgate.net/publication/400240400_Empirical_Evaluation_of_Automatic_Speech_Act_Classification_From_Logistic_Regression_to_GPT-4o)  
7. Evaluating Large language models on Understanding Korean indirect Speech acts \- arXiv, [https://arxiv.org/html/2502.10995v1](https://arxiv.org/html/2502.10995v1)  
8. We All Underestimate Semantics\! : r/LanguageTechnology \- Reddit, [https://www.reddit.com/r/LanguageTechnology/comments/1u6qw4u/we_all_underestimate_semantics/](https://www.reddit.com/r/LanguageTechnology/comments/1u6qw4u/we_all_underestimate_semantics/)  
9. From LLM to agentic AI: prompt injection got worse, [https://christian-schneider.net/blog/prompt-injection-agentic-amplification/](https://christian-schneider.net/blog/prompt-injection-agentic-amplification/)  
10. AGENTSEC04-BP02 Human-in-the-loop for critical decisions \- Agentic AI Lens, [https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentsec04-bp02.html](https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentsec04-bp02.html)  
11. Agent-Sentry: Bounding LLM Agents via Execution Provenance \- arXiv, [https://arxiv.org/html/2603.22868v2](https://arxiv.org/html/2603.22868v2)  
12. Build Long-running AI agents that pause, resume, and never lose context with ADK, [https://developers.googleblog.com/build-long-running-ai-agents-that-pause-resume-and-never-lose-context-with-adk/](https://developers.googleblog.com/build-long-running-ai-agents-that-pause-resume-and-never-lose-context-with-adk/)  
13. Reliable AI Agents with Temporal and LangGraph \- DevOpsVibe, [https://devopsvibe.io/en/blog/temporal-langgraph-reliable-agents](https://devopsvibe.io/en/blog/temporal-langgraph-reliable-agents)  
14. When Planning Fails Despite Correct Execution: On Epistemic Calibration for LLM-Based Multi-Agent Systems \- arXiv, [https://arxiv.org/html/2605.23414v1](https://arxiv.org/html/2605.23414v1)  
15. AI Agents Need Alignment, Not Prompts. I Built AI Runtime Governance Layer. \- Medium, [https://medium.com/@akarlaraytu/ai-agents-need-governance-not-prompts-i-built-ai-governance-layer-caf52c4d4bff](https://medium.com/@akarlaraytu/ai-agents-need-governance-not-prompts-i-built-ai-governance-layer-caf52c4d4bff)  
16. Why We Use LangGraph for Agentic AI Applications \- Laava, [https://laava.nl/en/langgraph-agentic-applications](https://laava.nl/en/langgraph-agentic-applications)  
17. Agentic Workflow Orchestration: Taming LLMs with Graphs, State, and Control Loops | by Lamhot Siagian | Medium, [https://medium.com/@lamhot.siagian/agentic-workflow-orchestration-taming-llms-with-graphs-state-and-control-loops-0688f018b99f](https://medium.com/@lamhot.siagian/agentic-workflow-orchestration-taming-llms-with-graphs-state-and-control-loops-0688f018b99f)  
18. Harnessing Embodied Agents: Runtime Governance for Policy-Constrained Execution \- arXiv, [https://arxiv.org/html/2604.07833v3](https://arxiv.org/html/2604.07833v3)  
19. AI Governance Platform: Agentic Workflow Governance Layers Compared \- Form.io, [https://form.io/ai-governance-platform-agentic-workflow-governance-layers-compared/](https://form.io/ai-governance-platform-agentic-workflow-governance-layers-compared/)  
20. Multi-agent Orchestration in CMMN and BPMN | Flowable Enterprise Documentation, [https://documentation.flowable.com/latest/ai/ai-orchestration](https://documentation.flowable.com/latest/ai/ai-orchestration)  
21. Workflow Engine: What It Is, How It Works, & Benefits | Salesforce, [https://www.salesforce.com/agentforce/workflow-engines/](https://www.salesforce.com/agentforce/workflow-engines/)  
22. [2511.22354] LLM-Based Generalizable Hierarchical Task Planning and Execution for Heterogeneous Robot Teams with Event-Driven Replanning \- arXiv, [https://arxiv.org/abs/2511.22354](https://arxiv.org/abs/2511.22354)  
23. Do Agents Need to Plan Step-by-Step? Rethinking Planning Horizon in Data-Centric Tool Calling | Request PDF \- ResearchGate, [https://www.researchgate.net/publication/404751848_Do_Agents_Need_to_Plan_Step-by-Step_Rethinking_Planning_Horizon_in_Data-Centric_Tool_Calling](https://www.researchgate.net/publication/404751848_Do_Agents_Need_to_Plan_Step-by-Step_Rethinking_Planning_Horizon_in_Data-Centric_Tool_Calling)  
24. Do Agents Need to Plan Step-by-Step? Rethinking Planning Horizon in Data-Centric Tool Calling | Request PDF \- ResearchGate, [https://www.researchgate.net/publication/405252718_Do_Agents_Need_to_Plan_Step-by-Step_Rethinking_Planning_Horizon_in_Data-Centric_Tool_Calling](https://www.researchgate.net/publication/405252718_Do_Agents_Need_to_Plan_Step-by-Step_Rethinking_Planning_Horizon_in_Data-Centric_Tool_Calling)  
25. Runtime Governance: The Missing Layer for AI Agents in 2026 : r/AI_Agents \- Reddit, [https://www.reddit.com/r/AI_Agents/comments/1td1hff/runtime_governance_the_missing_layer_for_ai/](https://www.reddit.com/r/AI_Agents/comments/1td1hff/runtime_governance_the_missing_layer_for_ai/)  
26. What Breaks When LLMs Code? Characterizing Operational Safety Failures of Agentic Code Assistants \- arXiv, [https://arxiv.org/html/2605.30777v1](https://arxiv.org/html/2605.30777v1)  
27. Harnessing Embodied Agents: Runtime Governance for Policy-Constrained Execution, [https://arxiv.org/html/2604.07833v1](https://arxiv.org/html/2604.07833v1)  
28. Harnessing Embodied Agents: Runtime Governance for Policy-Constrained Execution \- arXiv, [https://arxiv.org/pdf/2604.07833](https://arxiv.org/pdf/2604.07833)  
29. Secure ג€Human in the Loopג€ Interactions for AI Agents | Auth0, [https://auth0.com/blog/secure-human-in-the-loop-interactions-for-ai-agents/](https://auth0.com/blog/secure-human-in-the-loop-interactions-for-ai-agents/)  
30. Building AI Agents That Wait For Humans | Microsoft Community Hub, [https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/building-ai-agents-that-wait-for-humans/4496310](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/building-ai-agents-that-wait-for-humans/4496310)  
31. Human in the loop (HITL) AI Agents with LangGraph & Elastic \- Elasticsearch Labs, [https://www.elastic.co/search-labs/blog/human-in-the-loop-hitllanggraph-elasticsearch](https://www.elastic.co/search-labs/blog/human-in-the-loop-hitllanggraph-elasticsearch)  
32. A Unified Evaluation and Governance Framework for Trustworthy LLM Agents \- TechRxiv, [https://www.techrxiv.org/doi/pdf/10.36227/techrxiv.176799772.28164151](https://www.techrxiv.org/doi/pdf/10.36227/techrxiv.176799772.28164151)  
33. AI Human in the Loop: Production Oversight Patterns \- Redis, [https://redis.io/blog/ai-human-in-the-loop/](https://redis.io/blog/ai-human-in-the-loop/)  
34. Agent Workflows Are Rediscovering Durable Execution | by Koshy | May, 2026 \- Medium, [https://nittikkin.medium.com/agent-workflows-are-rediscovering-durable-execution-be110661ed8c](https://nittikkin.medium.com/agent-workflows-are-rediscovering-durable-execution-be110661ed8c)  
35. Separating Intelligence from Execution: A Workflow Engine for the Model Context Protocol, [https://arxiv.org/html/2605.00827v1](https://arxiv.org/html/2605.00827v1)  
36. Cong Yang \- CatalyzeX, [https://www.catalyzex.com/author/Cong%20Yang](https://www.catalyzex.com/author/Cong%20Yang)  
37. Agentic LLM Planning via Step-Wise PDDL Simulation: An Empirical Characterisation, [https://arxiv.org/html/2603.06064v1](https://arxiv.org/html/2603.06064v1)  
38. The Evolution of AI Agent Planning: From STRIPS to Large Reasoning Models | by Tao An, [https://tao-hpu.medium.com/the-evolution-of-ai-agent-planning-from-strips-to-large-reasoning-models-a20aef9e454e](https://tao-hpu.medium.com/the-evolution-of-ai-agent-planning-from-strips-to-large-reasoning-models-a20aef9e454e)  
39. Frontier Large Language Models Rival State-of-the-Art Planners \- arXiv, [https://arxiv.org/html/2511.09378v2](https://arxiv.org/html/2511.09378v2)  
40. AI agents news without the hype \- Scouts by Yutori, [https://scouts.yutori.com/31a0bc42-f2a9-497d-ab06-90b9b2d15901](https://scouts.yutori.com/31a0bc42-f2a9-497d-ab06-90b9b2d15901)  
41. Agentic QA Architecture: Reasoning Loops, Self-Healing DOM & Autonomous Testing, [https://testquality.com/agentic-qa-architecture-autonomous-testing-2026/](https://testquality.com/agentic-qa-architecture-autonomous-testing-2026/)  
42. When Planning Fails Despite Correct Execution: On Epistemic Calibration for LLM-Based Multi-Agent Systems \- arXiv, [https://arxiv.org/pdf/2605.23414](https://arxiv.org/pdf/2605.23414)  
43. The CISO's Guide to Runtime Governance for AI Agents \- APERION, [https://aperion.ai/blog/ciso-guide-runtime-governance-ai-agents/](https://aperion.ai/blog/ciso-guide-runtime-governance-ai-agents/)  
44. Causality Laundering: Denial-Feedback Leakage in Tool-Calling LLM Agents \- arXiv, [https://arxiv.org/html/2604.04035v1](https://arxiv.org/html/2604.04035v1)  
45. conductor/docs/architecture/durable-execution.md at main \- GitHub, [https://github.com/conductor-oss/conductor/blob/main/docs/architecture/durable-execution.md](https://github.com/conductor-oss/conductor/blob/main/docs/architecture/durable-execution.md)  
46. How to Build Human-in-the-Loop Oversight for Production AI Agents \- Galileo AI, [https://galileo.ai/blog/human-in-the-loop-agent-oversight](https://galileo.ai/blog/human-in-the-loop-agent-oversight)  
47. Human-in-the-loop patterns ֲ· Cloudflare Agents docs, [https://developers.cloudflare.com/agents/concepts/agentic-patterns/human-in-the-loop/](https://developers.cloudflare.com/agents/concepts/agentic-patterns/human-in-the-loop/)  
48. Agent Runtime: Infrastructure Layer Most Teams Underestimate | Augment Code, [https://www.augmentcode.com/guides/agent-runtime-infrastructure-layer](https://www.augmentcode.com/guides/agent-runtime-infrastructure-layer)  
49. Causality Laundering: Denial-Feedback Leakage in Tool-Calling LLM Agents \- arXiv, [https://arxiv.org/pdf/2604.04035](https://arxiv.org/pdf/2604.04035)  
50. Why Temporal Is Better Than LangGraph for Long-Running AI Workflows | Alongside, [https://www.alongside.team/blog/temporal-vs-langgraph-long-running-ai-workflows](https://www.alongside.team/blog/temporal-vs-langgraph-long-running-ai-workflows)  
51. AI Workflow Orchestration Platforms: 2026 Comparison \- Digital Applied, [https://www.digitalapplied.com/blog/ai-workflow-orchestration-platforms-comparison](https://www.digitalapplied.com/blog/ai-workflow-orchestration-platforms-comparison)  
52. Overview of EPC-AW. EPC-AW consists of three agents, the Planner,... | Download Scientific Diagram \- ResearchGate, [https://www.researchgate.net/figure/Overview-of-EPC-AW-EPC-AW-consists-of-three-agents-the-Planner-Executor-and_fig1_405221474](https://www.researchgate.net/figure/Overview-of-EPC-AW-EPC-AW-consists-of-three-agents-the-Planner-Executor-and_fig1_405221474)  
53. Do Agents Need to Plan Step-by-Step? Rethinking Planning Horizon in Data-Centric Tool Calling \- arXiv, [https://arxiv.org/html/2605.08477v1](https://arxiv.org/html/2605.08477v1)  
54. LLMs accelerate rapid reviews for log anomaly tools | Let's Data Science, [https://letsdatascience.com/news/llms-accelerate-rapid-reviews-for-log-anomaly-tools-9a5f0d0c](https://letsdatascience.com/news/llms-accelerate-rapid-reviews-for-log-anomaly-tools-9a5f0d0c)  
55. Orchestrating Intelligent Agents at Scale: How AgentCore and Temporal Create Robust AI Systems | AWS Partner Network (APN) Blog, [https://aws.amazon.com/blogs/apn/how-temporal-uses-amazon-bedrock-agentcore-to-create-robust-ai-systems/](https://aws.amazon.com/blogs/apn/how-temporal-uses-amazon-bedrock-agentcore-to-create-robust-ai-systems/)  
56. mohd-faizy/Agentic_AI_using_LangGraph: Agentic AI framework built using LangGraph and Multi-Agent Control Plane (MCP) for building structured, goal-driven multi-agent systems. \- GitHub, [https://github.com/mohd-faizy/Agentic_AI_using_LangGraph](https://github.com/mohd-faizy/Agentic_AI_using_LangGraph)  
57. Towards Autonomous Cyber Deception: An AI Agent for Dynamic Honeynet Management \- WebThesis, [https://webthesis.biblio.polito.it/38697/1/tesi.pdf](https://webthesis.biblio.polito.it/38697/1/tesi.pdf)  
58. Poster Session 3 \- MLSys 2026, [https://mlsys.org/virtual/2026/session/3719](https://mlsys.org/virtual/2026/session/3719)  
59. From Agent Traces to Trust: Evidence Tracing and Execution Provenance in LLM Agents \- arXiv, [https://arxiv.org/html/2606.04990](https://arxiv.org/html/2606.04990)  
60. Durable Execution for AI Workflows: Multi-Day Patterns (2026) \- Taskade, [https://www.taskade.com/blog/durable-execution-ai-workflows](https://www.taskade.com/blog/durable-execution-ai-workflows)  
61. SAGA Made Microservices Reliable. Agent Harness Makes AI Agents Reliable. \- DEV Community, [https://dev.to/sreeni5018/saga-made-microservices-reliable-agent-harness-makes-ai-agents-reliable-3d1k](https://dev.to/sreeni5018/saga-made-microservices-reliable-agent-harness-makes-ai-agents-reliable-3d1k)  
62. Your AI Agent Didn't Fail ג€” It Stopped Halfway | by Zenefa Rahaman, PhD \- Medium, [https://medium.com/data-science-collective/your-ai-agent-didnt-fail-it-stopped-halfway-cc5a6cc58b0c](https://medium.com/data-science-collective/your-ai-agent-didnt-fail-it-stopped-halfway-cc5a6cc58b0c)  
63. Built with Opus 4.7: a Claude Code hackathon \- Cerebral Valley, [https://cerebralvalley.ai/e/built-with-4-7-hackathon/hackathon/gallery](https://cerebralvalley.ai/e/built-with-4-7-hackathon/hackathon/gallery)  
64. Oversee a prior art search AI agent with human-in-the-loop by using LangGraph and watsonx.ai \- IBM, [https://www.ibm.com/think/tutorials/human-in-the-loop-ai-agent-langraph-watsonx-ai](https://www.ibm.com/think/tutorials/human-in-the-loop-ai-agent-langraph-watsonx-ai)  
65. PlanBench: LLM Planning Benchmark \- Emergent Mind, [https://www.emergentmind.com/topics/planbench](https://www.emergentmind.com/topics/planbench)  
66. Temporal \+ LangGraph: A Two-Layer Architecture for Multi-Agent Coordination \- Anup Jadhav, [https://www.anup.io/temporal-langgraph-a-two-layer-architecture-for-multi-agent-coordination/](https://www.anup.io/temporal-langgraph-a-two-layer-architecture-for-multi-agent-coordination/)  
67. Bring Your Own AI (BYOAI) \- Trisotech, [https://www.trisotech.com/bring-your-own-ai/](https://www.trisotech.com/bring-your-own-ai/)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAaCAYAAABCfffNAAABX0lEQVR4Xu2UvyuFURjHv0LRJUn5keQaDaKUbEoWG3U3me0G/gD/gUkoGWxSBsUmI2WQwWDAYFXKKL7fnvfUued1Oefed3M/9Rnu87z3PO85z3NeoEmBtNA+OhTE22kpiCWjxc/oJ/2ir/SKlmkn3acr7uF6GKQn9JRO0NYsvkxv6QV9p5NZPJkp+kLfYLvx0e8t2M5uaG91Oo5r2AIbyBdwqDfPaOCoVOCe9ocJDxXRy4yHiRjGYEU2w0SAilRgzU9mjX7Q6TBRFF30kh4h3wtNlo5PO/DVf5JwRQ6DuNAI38EmTsfp7syq/1AMbfQYPxfxUYED5HcbjRp+jtoN1Z1QkbpH16FPiI5lFtVvW4aNrX8Be2C7GqE7dAbWq44sX5M5+gh74ye6C1v4gc7DbrtjmI7SAbpHu73cn2iadNF0F5Zgu/itBwtosE8xbNP1MFg06tViGCyapF40+Wd8A3+eN4JarTzoAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAeCAYAAADgiwSAAAAAo0lEQVR4XmNgGOpABV0ABhSBeCG6IAy0ArELuiAIcADxViCWRhbMA+L/aPgnEFuCJHmAWBKII4D4H5QtBsTMIEkYKGeA6MIALEC8Boifo0uAgDgQ3wXiA2jiYGADxL+BeBK6BAgUMUDsC2KAWAFynDBIAmbfWyDWBGJjIF4MxJxgbQyQIHvIAPHGKiA2g0mAgC8QfwTiDUDsiSwBA7DAGAXIAAD8ORoJ0Ewr5QAAAABJRU5ErkJggg==>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAZCAYAAAAiwE4nAAABOElEQVR4Xu2UsUoDQRRFb9CAQkBEMQhaWkgawU4QLG20sNXGSrCX4Af4HWKRwk4LG7FIl8I/UCwUbBTLNIqYe3mzOPtETTGjzR44sDtvdy/zdmaAin9kjY76wVxM0Tva9IUctOgz7dNlV0tOnZ7SM/xR4Ca9hM3yg26Uy2mZoT26SmdhgVulJxKjsPlw3YAFHn2W0zJOd6L7GizwJBpLisIUGqPACzoW7qdpl76G2gO9CR6EZ4ZCbbyFfcTbhbW3QDPv0OtobAG2Z1X7FS0Q/TstGI8C72ELqEDbRNtlOxpbpC8Y4lSaoFf4fiUq0O9FBenjChGa1SGsrT8yQs/pE13C13boAHgLrsPq8pg+0l26D2utDoo5ey0tRTv3fCEXaqdvcVbUTrVw0hdy0KbvQW2BlXK5oiIhA0JUPHqyvCP7AAAAAElFTkSuQmCC>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAZCAYAAAC/zUevAAABTUlEQVR4Xu2Vr0tDYRSGj2jwF6yIoli0WRxDRAwGxWJYM6yPLdkFEUwLxlWTS4JGsdmFMdB/wGD1f5D5vvvON8+OU/DuUwz3gSec9+ze7+xsuxNJxx4c86FShjUfpqYEL31o4HCnPkzJNryDsy5vwElTc5AjUyeFh1ELD+dgnlsZHKzPAbz4odXelR+H8TMn07AJ2/AN3sAl7ZEOXDB1nzV4KOGiLjzX2nqsvZbWW70rRebgA9zUOrIPn11GHmHRh5YXCQfFd2XZkOG9RfgkoR+J2zkxWcS/9hNZhhi2iVUJ9+I21uGU6f3KJmbgvct5OO/FYfgx2mfHl9+JSJYhiP91LEvYzhksmJxcwwmXDZB1CK77Cu74hmMFzvvQk3UIkuyJOcoQJMl/x6hDJOFfDPEq4aA6HDc5V7yrvYrWyYmPZO93vZb2c3Jycv6Ed1LFX3ohZR55AAAAAElFTkSuQmCC>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAcCAYAAAD1PDaSAAADBklEQVR4Xu2WS6iNYRSGX7nkmmvJpUQiuSW3jEwIAxOXKAxRMjKgjM5EJqSMkDgGMqAM5JrYUSgTKSWlDhMxEcWAXNbT+n97/d++28fZR5233vb+1v/t/a9vXd71SQNoiN3GQakxwwzj2NTYSQw1nkuNhhfGxWHdbVwb1h3FKuP11Ch3elJYrzdeM44Ito7hSMYUl4xDwnqa8YlxXrB1BMPlUd4YbIeNj4xvjTeNizL7aON944Zs3TJoiovGK/IXN4tlxqNhPcX4zLg02MAOFUsjxwXjodTYLPYaf6my7uoBBXglj2SOWk6fVHUlactp/hSnP6vY4bVAZu7KfxNLgQM/Ni4PtvHGp9n32cYJ4RlOHwjrlkAd4gBspsbOyPd+UTGqo+SHiQeh0d4YJxq7VFaLtmualFLTOFJNrnKQ4oPG5/K9JfnLI6pJ3uCMEUgekY6K0hJowM1yR3qKjwpgz3d587GXl6YgkshbI3SrjeHCSWnEWcZ3xp/Fx3+wwvhRXhocEqdrNdESNR4aJ+TT868w07hAnuaS3JkUuVJQrzThQ/m+TXFTgn929yDKMZVr5JGOU4o/f53YUJm0CfsMlARNmIPR2iMvF5BLG6UR8VVeSvy+z7FfxUiTzvPGW/JBwdj9Fp7noDSQMfbkQNLGybPXjCJMlk/fYapdRhUgig/k0hPB+ofxffaJYqRInV4oH9UMipfysiGD3Deo/7nyEoO7jHuMW4ynjbdVKZsFTJeP6n3yMthZeFrGJ9VvMpymPObLZeu48ZS8JwhGrgrc9kpyp47JM8BzbneMf/pkjBpEmunDC+Ed1T4hk60e8v+Al+URRw5ZozKoA2DQfMg+12U2MEeeRfYjoXWlj0hzTUzVoFUQtbPGlfIokWow1XhP5UsUWk1/0Ce5xFH3W+UTcrU84/GuUhW8pJXrZzPgADkYOPEStF3FgUVWbmTfyfRVNXdJ63VQTjhAFFOgEl1hTYRHytWmt4PXNlARanebvEH/C6BS1DYKUrfR+hMoFUqgrpwNoL/gNye0k0lpxEk5AAAAAElFTkSuQmCC>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAdCAYAAABWk2cPAAAB00lEQVR4Xu2WTSsGURTHj6Io5XVBlJSN2MnOxkL5ABYka9ZKykIPJcnOByAJG2UhryssbKxZkLxEytqGEv9/Zyb3OTPTMzPPi41f/Xq6597m3ufec8+MSHKa4DyssR2isWXYajvyoRpuwC7b4dAB1yV8UYnhQ45gj4mPwivY6MS64bnTTk0fPIN1Jr4Ct2G5E+OOnDjt1IyLbpvLBfyET/DQ9NmxqeA/mjGxTngHe02cTNtAGrhy+yAuZBOWmTixY1MR9k8vRbedMGtdCjLppATP6VE0wRpgJrsrMDYVYdm7DxfhKmxz4szeA6edFxNwTsLP0GVWdGxO+CBuU63tcChoReKEPJ9vzzXTx5X7FKz2jsEv+OL9cmJ/C7lye/Hzhlt1Dyu8dpXoubV77djnk4R6+Z3QhfeSdzBj4kXlGO6JvjFKBmvqlmS/PcLoh8+iecDCT69Fq1WuqxXgFg7aYATMVk7sw8lG4IATi8UurLTBCFhnX02M+TBsYjlhIsWB278jWhJ9eF/55RCWoJGw8vAzJA4t8EG01g7BJXgDp5wxseDL2X4LRcEXwYfoIptFS2niBCJMgjj4W3squjslwd/aBRMvGkyWN9H7+S76efrP3/MDEDlOgD+xgNIAAAAASUVORK5CYII=>

[image7]: <data:image/png;base64,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>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAcCAYAAACtQ6WLAAAAkElEQVR4XmNgGBxAEIgZ0QVBgBWI/wOxJ7oECAgD8XMg1kSXgAEOdAGCgJkBYiwGUAHi00D8GojlkSVcgLifAeL8dCCOQJYEOdsUiDmBeAcQKyJLwoAOEL9nwBEADUD8D10QBPiB+AQQXwdiZSAORJa0AeLfQDwJiEsZ0BzlywAJUxC9nAGLf0HBJokuOOIBACXsEVMbAsH9AAAAAElFTkSuQmCC>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAaCAYAAACO5M0mAAAAsklEQVR4XmNgGNqAFYiF0AXRgRgQnwPin+gS6EAdiF8C8XV0CbIADxALAzEjugQymADEF4D4IRBvB2J+VGkIAPkyhwFiki8Q/wfidBQVUBANpTmAeCsQfwViY4Q0JpAG4gdAfBqIBVGlUIENEP8G4vkMBDxUzoDHfTBAtLUuQPyPgQRrYSGAAmSB2AqImRkgwfIJiPVRVEDBawaEJCi1TAdiFhQVUBAMxLOAeBIDxNThDwBwKR3PC74dWAAAAABJRU5ErkJggg==>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAZCAYAAADe1WXtAAABC0lEQVR4XmNgGAWjYISDYCB+BsRPgPgPEL8C4l9A/A6IH0HxQrhqIoAhEJ+EsqWBeA+UXg7ELjBFSIAViJnRBdGBJhDLQ9keQLweiDmA+DAQ68MUQQHI9VeBWARNHCdgYYC4rhzKPw/EkghpMJgExEuBmBFNHCfIAeK7QCwO5X8FYmOENBiAwt0GTQwvuA7EaxggLgaB/0AcjZAGA5jXNYB4BhA7oMhiAeiGgPig4IBZAvIyyFJzIE4FYh8g9oTK4QQCWPigCIMBUKSBktV9IG5lgKQCigHIFyCvmwLxQwaIJaCkRxGYwwAJClDkXQNiJSBWRFFBIuAB4v1QtgwQHwfiHgYSktYoGIQAAFm6KDuXvOHWAAAAAElFTkSuQmCC>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAeCAYAAABAFGxuAAACaElEQVR4XtWXT0hUURSHj2SgKBUGhShUEm1sZRAEtggKCkklCpTCVSJtFAoMxK0LIYLaVJtKQoQIWkjgwoVQi6CgWoigtWijuEncuGiTvx9nBs8c75u5M/PGsQ8+hnfumzdn7p9z7xNJnxrYD6/7BtG2e/Cab9gLuuGkaBIhDsLn8LxvqCR98KXkJtUGf8PLJlYPZ+FVE6so7+BtF2NCv+ApF38In7pYxfgEz5nrBbgGt+BHEyecg/MuVjG+wlZzXQc/wDETy8I/wPv3hO+w2Vxnh9Emm4WJ8f6CdMHHohOzVHyPTYj2GHuuycRJdI+tw1X4Bja4tlj4Q3aOMSkmx1U6YuIkao7dgBdEE3oF3+Y2R+NX5QP4Hj6BPSZOuCqZdCIseHfzXBdDqI4dER1KC6cL/wQ7Iy8HYKMPlkhqlX8QbsJ/cFz0i4SfLyTiAY7U9kom9DfzSe9k4hfhjJS3SsuC+xWH8hCchp/hYfgaXtm5rfqwSg+JTuR9BefGHDzuG6oNC+SGD2ZgVR8VHepy4TP4rGiYGPe3EPfhkoT3vmK5Bf/4YD44v9I4J7EuplUbpVa0IjM5TwdckdyTaCFYcjysAlz9P+CAa0ukBS7CThfnfHgkevDjcMbyDJ4w1+2imzkLLUdlyrTlhb2xLJqg5SS8JHp2P5uJsfDeLOAw/CK6gbNWsgd5XuMQL4hu5FGwNziUHNIQLCPZnaCYxHplZ6sjoReUkuFDTosWYP9ikURojhF7gCwbzg+ecEObc4ikVVn0MMYQ+qEkko49HMafsnuBVY0zokPL08s3eDS3uXqwB4+Jrs7/l22E12JWCdATKgAAAABJRU5ErkJggg==>

[image12]: <data:image/png;base64,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>

[image13]: <data:image/png;base64,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>

[image14]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAABACAYAAACnZCtBAAAEuElEQVR4Xu3dS6jtUxwH8CWPyCuPPEIeSXklKVKSASKRUJSJGQOZKAaMxMBAHqUkioFEikKEcmLiUaSISCGPEUoYkMf63v/ezrrLf9999rl332R/PvXt7P9a//M/65zRr7XWf51SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP53dp1kFe1Sc0DfCADQurPmm5ofan6tuaXm6JrX2puWaPeaR5vrfH64ySFN30FNf75e0vTN0z5zLPev37p0KdJurPmguX6pZv9/7gAAqPaqubvmy5rrJm371TxR83nNu5O2Zbuy5vjJ5xQu15ThZ39bc0MZCrqpvWs+qvmr5qqag5u+eXL/gzV/1Nw2uU5SoOZ5363funT5nfN7XNq0vVWGsQAAbJEZtBQpswqE9F3WNy5BZpl+7Bur68tQSB7ed1RPla2LuI3as+bFmgf6jjIUTmt945KkKE1xeFzNs037oTUfT/oBgBWXmbXna54uswuf72tO7BuXYK0MRVQvBdQvNWd07SdPshkpkFIotYXodIYuPy8zizvDsTXP1OxW80LXl2Iy/QDAisssTmbQUjDMcm7fsCQZx8V9YxmKq/Rd0bRdXcaLu426qwzP3GdyfVjN++vdG5Il4/vKsFybZ03zVc0dzX2zpFh+uQyF6Oll2JPXSnvGCQCsuGmRsVmZlZru/5qXecZm0SLLgxnjrU3b2zVnNteLWivDM6cvGfxW80XTvxEf1vxchgIt35+vySdlvPDsZdYys5fHlPHiM0vAmemzLAoAKyz7uFK0vNl3lKFYaJN7l23WPrXIOLN0GFnG7GejFpXnfd1cP17WC8IcqzHvWJEDy3ohdUrNZ03fRmXJM+N4qIwvR2f2b23yFQBYUSkEUjCsde17lGGmaDr7ljcYT9vqjh0vBdK8gi2F5ZE173R9m5HntbNaeXnh7MnnV8tiR2rkpYj8jRaVAjTjmPWzFGwAwBYpGLKPbUw/CzXm/LJe2M3LPD+V2YVhvj/9OeKjPYttM7Ls+nvNOX1HdVYZlmAXkWXNRfeaZXYuv9Na195K8Zrz73J8CQCwwqYvHfSmBcXY3qplmVVERQ7xzXgu6DtGXFhzcxlfZoxry7Bf7YiuPT7trjP79XrNCV17K+NqX4hojY0lL3jcXoY3c9ea9qOaz5GXLR7p2gCAFXVSGYqOnIGWDfjPlWF/1b1lfZlwZ8hs3ti5aJHDe2fNBPayRPln2fog2siLAP2sX5++QMosV56Vom1M+vMfCmbtqZs1lsj3vFFzU8175d8vF2RPXfbHAQBscUzN5WX4zwLnbdWz8zxZZu8Fu6jm1L5xG7JEOVYkbUZmujK2MSmy5u0x29ZYcjRIZuH6Zc/pwb45+gMA4D8jy4ZZJtwRRcpjZdtnyy0ixdr2zDQ+VhYfS853e6VvBAD4Lzi6DIfibo88IwfR7giZQcv/HF204Jra7FiyBLw958wBACxVDpTdt29cETlS5Z6+EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAJfgbBjzMHZ/6f28AAAAASUVORK5CYII=>

[image15]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAZCAYAAADXPsWXAAAA3klEQVR4Xu2RrQoCURCFR1BQ0CaCzWAziF0fwGCx2kwmgwbtYhfBYjMYzGI1aPUlfAWr+HMOd4W7w3V3xXo/+Fh2zmV29o6Ix0UKTuFaqelLOB+GY8MWvuBGBxZ7mNdFm7mYJgeYVRmpwIYuakZimpxhQWX85UXwjKQjpskVllXWgkdVc1KHN3iHTas+hiuYtmpf4dc5BafhVKQGL7D6ORQH74H3wSYTmIE7OLAPxcGNcDNssoTd4D1ypS44AZuc4EwSbMNFT0yTJyypLDFtMU0eOviFnJi7KOrA4/mXN4c7JorYOgWqAAAAAElFTkSuQmCC>

[image16]: <data:image/png;base64,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>

[image17]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAWCAYAAAArdgcFAAABL0lEQVR4Xu2UrU4DQRSFD6EIEpIWCAKDR1UgSCpQmAoEGEQNTwFP0McgTUVNgwNNmkp4AGx5AAwJFYi25zAzye0ddhdDavoln9iZe247P7vAmlXToC16RLfcXBU2mzGkE3pPn+jH0mwxe8izbVuwTV/pQXzeoDf0NBWU8Ig8+4mY1UOPnsfJxA7Cvz924xZlZ8izI8SV7yL88omdjczphR80KPuFPNtHyOKQviMvECq484MGZUuba9lagi8QVc2VLW3eRDgAXyCqmitb2vxft6XoQHUTVHDlxi1FBzpAbF6jD3AXH+Eq/ha0KKsmPjtCyP6wT8e0ngbIddSi5WoLtR2JF+TZb7jsG32mHdqlU7ppCxC2SC+c3uiEbozP3sJl9aE6iwWXCKv5Kz67ZkUsAL7KRqqcxG+UAAAAAElFTkSuQmCC>

[image18]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAWCAYAAAArdgcFAAABA0lEQVR4XmNgGAWDATACsQoQM6NLEAACQGwFxHLoEiAAMlQLiDcC8QMglkSRxQ2EgHgVA0TPXCDeAsSeyAp0gfgvEH8D4v9A/JCBeMM3A/FpIBaF8kGO/ATE5nAVUGAMxF8ZiDccZNA/IHZBEz8AxG/RxEg2XJABoh6kDxksZICEAAog1XCQGpoZrslAQ8P1GWhoOE2DBVeELmWgguEsDBBDUDINAyQpgsyBA1Ca9QDi30D8CogNkCWhAORddItPAfEhIOZHEvsFxOEwDkgxyAXo+AAQ88AUAUEQEM8HYk4kMVCKuQ7E+4A4GohbgbiMgfSyCSdgBWI7BojhgWhyo4COAACXQ0aYGZPAvwAAAABJRU5ErkJggg==>