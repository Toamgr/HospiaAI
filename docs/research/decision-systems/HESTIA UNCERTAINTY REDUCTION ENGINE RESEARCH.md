Research archive note: This document is supporting research for HESTIA Venue Intelligence. It is not canonical product doctrine, current production behavior, or implementation authority. Do not implement it directly without HESTIA's provenance, confidence, role-access, venue-boundary, evidence, and human-approval guardrails. It must not be used to create fake Venue Memory, fake Venue DNA, fake KPIs, fake economics, fake market truth, fake cross-venue intelligence, or automatic operational truth.

Uncertainty guardrail: This is research support for HESTIA's intelligence model, not an implemented production engine. Uncertainty scores, confidence labels, memory candidates, and Venue DNA candidates are not confirmed truth. The engine reduces uncertainty; it does not eliminate uncertainty.

# **HESTIA Uncertainty Reduction Engine: Architecture of an Epistemic Operating System for Venue Intelligence**

## **Foundations of Operational Uncertainty in Hospitality Venues**

A hospitality venue is a complex, dynamic, and non-ergodic socio-technical system where physical environments, human behaviors, and high-frequency transaction cycles constantly intersect1. In this environment, operational decision-making is routinely compromised by incomplete, distorted, and rapidly degrading information. Traditional venue management systems rely on retrospective dashboards that present historical data as absolute truths, failing to represent the margins of what the system does not know. To transform a venue into a resilient, high-performing asset, a Venue Intelligence Operating System must operate on first principles of epistemic integrity3. This requires the explicit differentiation between physical, irreducible randomnessג€”aleatoric uncertaintyג€”and informational, reducible knowledge deficitsג€”epistemic uncertainty4.

                                 [ PHYSICAL VENUE ]  
                                         ג”‚  
                        ג”ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”´ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”  
                        ג–¼                                 ג–¼  
               [ Aleatoric Noise ]              [ Epistemic Gaps ]  
             (Sensor / Spatial Noise)         (Reducible Deficits)  
                        ג”‚                                 ג”‚  
                        ג””ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”¬ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”˜  
                                         ג–¼  
                             [ HESTIA OPERATING SYSTEM ]  
                                         ג”‚  
                 ג”ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”´ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”  
                 ג–¼                                               ג–¼  
     [ Threat & Error Management ]                 [ High-Reliability Organizing ]  
      \- Threat Identification                       \- Sensitivity to Operations  
      \- Human Error Detection                       \- Preoccupation with Failure  
      \- Undesired State Prevention                  \- Deference to Domain Expertise  
                 ג”‚                                               ג”‚  
                 ג””ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”¬ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”˜  
                                         ג–¼  
                         [ Causal Inference & Adjustment ]  
                            \- Unobserved Confounders  
                            \- Counterfactual Simulations  
                            \- Do-Calculus Estimations

Physical variables, such as momentary sensor fluctuations, acoustic spikes, or guest arrival rates, exhibit aleatoric variations caused by environmental noise4. Conversely, the internal beliefs of the venueג€”such as guest preferences, staff capability models, and brand positioningג€”suffer from epistemic uncertainty5. This uncertainty can be systematically quantified, modeled, and reduced4.  
To navigate this landscape, the HESTIA Uncertainty Reduction Engine integrates three frameworks adapted from safety-critical domains:

1. **Aviation Threat and Error Management (TEM):** This framework assumes that operational personnel will inevitably encounter external threats and commit operational errors1. HESTIA models the venue's operational trajectory by classifying occurrences into threats (events beyond the staff's control, such as a sudden supplier failure or weather anomaly), errors (actions or inactions by staff that deviate from operational standards), and undesired states (conditions that reduce the venue's margin of safety, such as extreme kitchen ticket backlogs or critical understaffing)7.  
2. **High-Reliability Organizing (HRO):** Operating a luxury venue under peak demand requires the structural mindfulness of an aircraft carrier or a clinical emergency department10. HESTIA operationalizes the five core principles of HROs to counteract cognitive biases:  
   * *Sensitivity to Operations:* Ensuring that leadership maintains continuous awareness of front-line execution realities rather than relying on abstract financial reports10.  
   * *Reluctance to Simplify:* Rejecting quick, single-cause explanations for operational failures, such as labeling a slow service shift as "poor staff performance" when the root cause was an uncalibrated kitchen routing algorithm10.  
   * *Preoccupation with Failure:* Treating minor operational anomalies and near-misses as systemic early warning indicators of latent vulnerabilities10.  
   * *Deference to Expertise:* Systematically routing decision-making authority during operational crises to the individuals with the highest context-specific expertise, regardless of their position in the corporate hierarchy10.  
   * *Commitment to Resilience:* Designing adaptive capacity and rapid-recovery protocols to absorb unexpected operational shocks without experiencing a total collapse in service quality10.  
3. **Causal Inference and Pearl's Ladder of Causality:** True decision intelligence cannot be achieved through correlative machine learning6. HESTIA structures its internal venue model as a Directed Acyclic Graph (DAG) to map causal mechanisms15. By utilizing structural causal models and Judea Pearl's do-calculus, HESTIA distinguishes between passive observations and active interventions15.

This causal framework prevents the common pitfall of unobserved confounding17. For example, if a venue sees a positive correlation between high table turn-rates and daily revenue, a correlation-based system might recommend accelerating service times15. HESTIA, however, identifies a hidden confounder: guest satisfaction17. Forcing faster turn-rates acts as an intervention, ![][image1], that damages long-term repeat visits, thereby reducing overall customer lifetime value15. By modeling these counterfactuals, HESTIA prevents short-sighted optimizations that compromise the venue's long-term viability16.

## **Taxonomy of Knowledge and Epistemic States**

To process information without introducing dangerous assumptions, HESTIA's knowledge graph architecture must systematically categorize and handle the distinct forms of data quality that manifest in hospitality operations3.

| Epistemic State | Core Definition | Graph Representation | Mathematical Representation | Operational Mitigation Strategy |
| :---- | :---- | :---- | :---- | :---- |
| **Missing Data** | The complete absence of an expected data point or relational edge6. | Null nodes or uninstantiated edges within a defined schema22. | ![][image2] | Active learning queries22, heuristic defaults, or structural imputation4. |
| **Weak Evidence** | Information derived from sources with low baseline credibility or low contextual relevance25. | Low-weight, high-variance edges in the belief network27. | ![][image3], ![][image4] [cite: 28, 29] | Bayesian updates using discounted likelihood models6. |
| **Conflicting Evidence** | Contradictory reports from independent sources regarding the same operational state28. | Divergent properties on a single node or opposing directional edges27. | High conflict metric ![][image5] in Dempster's rule29. | Jousselme distance filtering and evidence discounting28. |
| **Outdated Knowledge** | Previously verified information that has degraded due to temporal decay and operational shifts33. | Edges with high elapsed time since the last verification timestamp. | ![][image6] | Entropic decay schedules and automated re-verification sweeps. |
| **Unverified Memory** | Anecdotal assertions, personal intuitions, or unrecorded operator habits25. | Unstructured, unanchored semantic assertions in the scratchpad. | ![][image7], ![][image8] (high ignorance gap)29. | Automated validation prompts routed to cross-silo data streams12. |
| **AI Inference** | Probabilistic projections generated by statistical or generative models3. | Virtual edges marked with model lineage and algorithmic tags. | ![][image9] with variational epistemic bounds4. | Sandbox simulation33, bounded confidence intervals, and mandatory human-in-the-loop triggers5. |
| **Confirmed Operational Truth** | Multi-source, cross-verified, real-time operational facts3. | Cryptographically or structurally anchored ground-truth subgraphs3. | ![][image10], ![][image11] | Direct integration into the immutable core memory3. |

### **Algorithmic Handling of State Transitions**

HESTIA manages the lifecycle of these epistemic states by dynamically moving data assets across these categories as new information is digested. For instance, when a floor manager asserts that a VIP guest dislikes indoor seating (Unverified Memory), the engine does not immediately write this to the guest's permanent profile. Instead, it instantiates a temporary node with a high ignorance gap29.  
The engine then searches for corroborating historical table-assignment data from the Property Management System (PMS) and Point of Sale (POS) systems. If historical transactions confirm that 90% of the guest's indoor reservations were manually reassigned to the terrace, the node transitions to a Confirmed Operational Truth. If the systems yield no historical seating patterns (Missing Data), the engine schedules an active learning query during the next reservation confirmation cycle to resolve the gap22.

## **Mathematical and Algorithmic Framework of the Engine**

HESTIA does not utilize simple, single-scalar probability scores. To preserve the distinction between lack of evidence (ignorance) and contradictory evidence (conflict), HESTIA employs a dual-layered mathematical engine combining Dempster-Shafer Evidence Theory, Bayesian Doxastic Logic, and Structural Causal Models15.

               [ RAW OPERATIONAL DATA INPUTS ]  
                             ג”‚  
            ג”ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”´ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”  
            ג–¼                                 ג–¼  
   { POS, PMS, IoT Sensors }         { Human Input, Guest Reviews }  
            ג”‚                                 ג”‚  
            ג””ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”¬ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”˜  
                             ג–¼  
              [ EVIDENCE COMBINATION ENGINE ]  
              \- Formulate BBAs: mג‚(A), mג‚‚(A)  
              \- Compute Conflict: K  
              \- Apply Jousselme Distance  
                             ג”‚  
              ג”ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”´ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”  
              ג–¼                             ג–¼  
       [ LOW CONFLICT ]             [ HIGH CONFLICT (K \>= 0.7) ]  
     Apply Dempster's Rule        Discount Shaky Evidence  
              ג”‚                             ג”‚  
              ג””ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”¬ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”˜  
                             ג–¼  
                 [ PROPAGATE TO CORE MEMORY ]  
                   \- Epistemic Plausibility Models  
                   \- Localized Graph Updates  
                             ג”‚  
                             ג–¼  
              [ CAUSAL INTERVENTION ENGINE ]  
              \- Construct Structural Causal Models  
              \- Apply do-calculus: P(Y | do(X))  
              \- Evaluate Counterfactual Hypotheses

### **Dempster-Shafer Evidence Fusion**

Let ![][image12] be the Frame of Discernment, a finite set of mutually exclusive and exhaustive operational hypotheses29. A Basic Belief Assignment (BBA), or mass function ![][image13], is defined such that29:  
![][image14]  
Unlike classical Bayesian models that force unallocated probability into remaining hypotheses, Dempster-Shafer theory allows mass to be assigned directly to the power set ![][image15], representing true ignorance (e.g., ![][image16], meaning 80% of the belief is completely unallocated)29.  
To combine two independent sources of evidence, ![][image17] and ![][image18], HESTIA calculates the conflict metric ![][image5]29:  
![][image19]  
If ![][image20], HESTIA applies Dempster's rule of combination to yield a joint belief mass ![][image21]28:  
![][image22]  
If ![][image23], combining the evidence using classical normalization would produce highly counter-intuitive results by artificially inflating the plausibility of marginal hypotheses28. Under high conflict, HESTIA bypasses Dempsterג€™s rule and executes a **Jousselme Distance Adjustment**28. The distance between two belief states is quantified as28:  
![][image24]  
where ![][image25] is an ![][image26] matrix with elements30:  
![][image27]  
HESTIA uses this distance metric to identify and discount the weight of the outlier source before executing a weighted average consensus update28.

### **Epistemic Plausibility and Belief Revision**

To maintain a coherent world model, HESTIA represents its knowledge graph using Epistemic Plausibility Models, defined as structured tuples38:  
![][image28]  
where ![][image29] is the set of possible operational states, ![][image30] represents the epistemic indistinguishability relation for agent ![][image31], ![][image32] is a well-preordered plausibility relation (where ![][image33] denotes that state ![][image34] is at least as plausible as state ![][image35]), and ![][image36] is a valuation map38.  
When a contradiction is detected, HESTIA avoids global graph refactoring by executing a **Shock Update**27. A shock update downscales outgoing support from affected beliefs, localizing the contraction without destabilizing the rest of the venue's cognitive schema27. This is governed by a dynamic contraction rule that enforces the recovery of consistency3:  
![][image37]  
This process systematically demotes the plausibility of nodes linked to the contradictory data point while preserving the topological integrity of adjacent operational subgraphs27.

### **Causal Inference and Counterfactual Estimation**

To evaluate the impact of structural changes or operational interventions, HESTIA relies on Pearl's structural causal models16. For any causal query involving a targeted intervention, HESTIA utilizes the back-door adjustment formula to calculate the post-interventional probability distribution of outcome ![][image38] given action ![][image39] and a set of confounding variables ![][image40]15:  
![][image41]  
If unobserved confounders ![][image42] exist and block the back-door path, HESTIA searches for a valid mediator variable ![][image43] to apply the **Front-Door Adjustment**42, formulated as:  
![][image44]  
By calculating this estimator, HESTIA evaluates counterfactual hypothesesג€”such as estimating what the average guest spend *would have been* if a specific floor layout had not been utilizedג€”directly from historical observational data, eliminating the immediate need for expensive, risky real-world experimentation15.

## **Action Architecture of the HESTIA Framework**

To build a truly self-correcting venue intelligence system, HESTIA integrates core operational actions into a unified epistemic framework. The table below represents how HESTIA systematically processes, challenges, and acts on these parameters.

| Action Vector | Target Operational Trigger | Algorithmic Mechanism | Verification Protocols | Escalation Triggers | Core Memory Update |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Detect** | Discrepancies in data patterns across systems3. | Computes real-time divergence vectors. | Compares physical sensor data with transaction logs6. | Divergence exceeds safety parameters7. | Logs the variance as a temporary state in memory. |
| **Score** | Instabilities in operational inputs5. | Measures belief/plausibility boundaries29. | Uses cross-validation against historic data43. | Score falls below baseline thresholds5. | Writes a confidence rating to the node. |
| **Ask** | High-priority knowledge gaps during shifts22. | Calculates Expected Information Gain28. | Routes queries to designated domain experts10. | Query remains unanswered during peaks45. | Saves the verified answer as operational truth. |
| **Verify** | Unconfirmed qualitative human reports3. | Runs cross-system database checks3. | Cross-references inputs with POS and PMS data21. | Inputs cannot be verified by any system data. | Converts the node from unverified to verified. |
| **Remember** | Validated operational configurations3. | Saves assertions to core memory3. | Uses multi-source consensus filters27. | Data conflicts with core venue rules3. | Permanently writes the update to the graph. |
| **Challenge** | Flawed assumptions from venue leaders13. | Identifies mismatch in strategic goals47. | Runs structural causal model simulations16. | Decisions threaten core brand identity48. | Flags the leadership assumption as high-risk. |
| **Delay** | High-consequence decisions with low data quality5. | Pauses automation and queues verification5. | Schedules automated re-verification checks33. | Verification fails before the execution window. | Sets the decision state to "Pending." |
| **Escalate** | Critical system failures or safety risks10. | Triggers alerts to appropriate managers10. | Requires direct, manual GM approval10. | Operational metrics breach safety margins7. | Logs the emergency event in the system audit. |
| **Update** | Shifts in venue parameters over time6. | Applies entropic temporal decay equations33. | Schedules automated verification sweeps. | Core brand parameters degrade significantly48. | Re-calibrates the baseline values in the graph. |

## **Complete HESTIA Uncertainty Reduction Framework**

The HESTIA framework is organized into 19 distinct functional categories. Each category represents a core capability required to resolve data gaps, manage human communication, and maintain strategic alignment across the venue.

### **Layer 1: Epistemic Foundations**

This layer governs the acquisition, classification, and validation of incoming data. It prevents corrupt, outdated, or conflicting information from degrading the system's core memory.

### **1. Knowledge Gaps**

#### **Why it Matters**

Unidentified knowledge gaps lead to blind-spot decision-making, where the system optimizes local workflows while remaining oblivious to systemic structural deficits22.

#### **Signals of Uncertainty**

Active queries returning null parameters; zero-weight edges between critical entities (e.g., a guest profile with no linked transaction history); high entropy distributions in predictive models5.

#### **Data Needed**

System transaction logs, profile completion metrics, and user interaction histories21.

#### **Confidence Calculation**

The ratio of instantiated, verified edges to the total expected schema edges within a specific operational domain subgraph:  
![][image45]

#### **Who Can Verify**

Systems analysts, department heads, or the General Manager (GM).

#### **When HESTIA Should Ask Questions**

When a high-impact operational decision depends on an uninstantiated relational edge in the knowledge graph22.

#### **When HESTIA Should Stay Silent**

When the missing data belongs to a low-frequency, low-impact background parameter (e.g., historical weather patterns for a closed terrace).

#### **When HESTIA Should Escalate**

When a critical knowledge gap is detected in safety, security, or legal compliance fields (e.g., missing food allergy profile for a confirmed VIP table).

#### **How Uncertainty Should Affect Future Recommendations**

Recommendations are automatically downgraded, and a warning is appended highlighting the specific parameters missing from the calculation.

### **2. Evidence Types**

#### **Why it Matters**

Treating subjective observations and objective, transactional facts with equal weight corrupts the predictive modeling pipeline3.

#### **Signals of Uncertainty**

High discrepancy between physical sensor streams and manual log entries; qualitative claims lacking transactional proof6.

#### **Data Needed**

Multi-source operational inputs, including POS logs, IoT occupancy sensors, reservation software APIs, and manual shift notes6.

#### **Confidence Calculation**

The mass assignment is discounted by a source credibility factor ![][image46]28. Let ![][image47] be the Shannon entropy of the mass distribution28:  
![][image48]  
![][image49]

#### **Who Can Verify**

System integration administrators or domain-specific managers.

#### **When HESTIA Should Ask Questions**

When incoming qualitative assertions directly contradict primary transactional logs.

#### **When HESTIA Should Stay Silent**

When qualitative assertions match existing high-confidence historical trends.

#### **When HESTIA Should Escalate**

When critical operational telemetry diverges (e.g., POS shows a table as paid and open, but table occupancy sensors detect active physical seating).

#### **How Uncertainty Should Affect Future Recommendations**

Recommendations based heavily on qualitative evidence are tagged as "Speculative" and presented with explicit sensitivity analysis boundaries26.

### **3. Confidence Scores**

#### **Why it Matters**

Classical, single-scalar AI confidence scores hide the underlying reason for uncertainty, conflating clean but sparse data with rich but highly conflicting evidence5.

#### **Signals of Uncertainty**

High model variance; wide confidence intervals in predictive regressions4.

#### **Data Needed**

Historical prediction performance metrics, sample sizes, and parameter variance vectors5.

#### **Confidence Calculation**

Formulated using the Dempster-Shafer interval of Belief (![][image50]) and Plausibility (![][image51])29:  
![][image52]  
The operational confidence score is expressed as the interval ![][image53], where the width of the interval ![][image54] represents the system's structural ignorance36.

#### **Who Can Verify**

Decision scientists or HESTIA platform architects.

#### **When HESTIA Should Ask Questions**

When the ignorance gapג€”the mathematical difference between Plausibility and Beliefג€”exceeds a pre-set threshold (![][image55]) for a high-priority operational metric36.

#### **When HESTIA Should Stay Silent**

When the model's confidence interval remains tight and sits above the execution threshold.

#### **When HESTIA Should Escalate**

When the system must execute an automated action, but the lower-bound belief score falls below the venue's safety margin5.

#### **How Uncertainty Should Affect Future Recommendations**

Sub-threshold confidence scores trigger alternative backup strategies, shifting recommendations from "Optimize" to "Protect" modes2.

### **4. Contradiction Detection**

#### **Why it Matters**

Unresolved structural contradictions generate operational chaos and erode staff trust in the operating system's decision-making capabilities3.

#### **Signals of Uncertainty**

Mutually exclusive assertions co-occurring within the same context window; logical rule violations in the knowledge graph3.

#### **Data Needed**

Cross-departmental operational telemetry, strategic goal definitions, and staff logs6.

#### **Confidence Calculation**

Determined using the Dempster-Shafer conflict metric ![][image5], where ![][image56] establishes a verified structural contradiction28:  
![][image19]

#### **Who Can Verify**

General Managers or department heads.

#### **When HESTIA Should Ask Questions**

Immediately upon detecting an operational contradiction, to determine which branch of evidence is invalid28.

#### **When HESTIA Should Stay Silent**

During the active service peak, to prevent distracting the operational team with non-urgent cognitive reconciling.

#### **When HESTIA Should Escalate**

When a contradiction directly threatens physical safety, service execution, or brand identity during active service.

#### **How Uncertainty Should Affect Future Recommendations**

Recommendations linked to the contradictory node are immediately suspended until the conflict is resolved27.

### **5. Source Reliability**

#### **Why it Matters**

Venues ingest data from a wide variety of human and automated sources6. Failing to dynamically adjust the weight of these sources based on past performance leads to systemic manipulation or unmitigated human error propagation7.

#### **Signals of Uncertainty**

A specific sensor or staff member consistently submitting data that diverges from verified outcomes or peer measurements25.

#### **Data Needed**

Lineage metadata, historical assertion logs, and peer-comparison matrices24.

#### **Confidence Calculation**

Updated recursively using a beta-distribution model where ![][image57] represents verified true assertions and ![][image58] represents false assertions27:  
![][image59]

#### **Who Can Verify**

Operations Director or GM.

#### **When HESTIA Should Ask Questions**

When a historically unreliable source submits a high-impact, anomalous assertion.

#### **When HESTIA Should Stay Silent**

When low-impact observations are submitted by standard, well-calibrated automated sensors.

#### **When HESTIA Should Escalate**

When a highly reliable source makes an unprecedented, high-risk assertion (e.g., GM claims a major operational breakdown that is not yet visible on sensor telemetry).

#### **How Uncertainty Should Affect Future Recommendations**

Source-reliability scores are propagated down through the knowledge graph, automatically discounting the confidence score of all downstream conclusions27.

### **6. Data Freshness**

#### **Why it Matters**

Hospitality parameters degrade rapidly. A guest preference, staff availability window, or inventory count that was highly accurate 90 days ago may be completely invalid today6.

#### **Signals of Uncertainty**

High elapsed time since the last verification timestamp; high volatility in the underlying metric's historical time series4.

#### **Data Needed**

Node update timestamps, system audit logs, and parameter volatility indices.

#### **Confidence Calculation**

Managed via an exponential decay model33:  
![][image60]  
where ![][image61] is the elapsed time and ![][image62] is a domain-specific decay constant calculated from historical operational volatility (e.g., guest table preferences decay slowly, whereas daily inventory counts decay rapidly)33.

#### **Who Can Verify**

Front-of-House (FOH) or Back-of-House (BOH) inventory controllers.

#### **When HESTIA Should Ask Questions**

When the expired data is required to execute an impending service action (e.g., confirming a guest's dietary restrictions on a reservation 12 hours before arrival).

#### **When HESTIA Should Stay Silent**

When the expired data has no operational relevance to current or upcoming shifts.

#### **When HESTIA Should Escalate**

When critical safety or financial parameters have completely expired (e.g., point-of-sale tax tables or food safety log templates).

#### **How Uncertainty Should Affect Future Recommendations**

Outdated data triggers an automatic downgrade in confidence, changing the system's focus from "Execute" to "Verify and Update"5.

### **Layer 2: Operational Intermediation**

This layer manages the interaction between the system's internal reasoning and the human operators on the floor. It controls when, how, and whom the system should ask to resolve uncertainty.

### **7. Human Confirmation**

#### **Why it Matters**

Bombarding staff with confirmation prompts during peak service hours creates cognitive fatigue, leading to careless button-pressing and degraded service execution10.

#### **Signals of Uncertainty**

Low confidence scores on impending, high-impact operational decisions5.

#### **Data Needed**

Current service phase (peak vs. prep), staff cognitive load metrics (orders processed, ticket times), and decision impact score10.

#### **Confidence Calculation**

Calculated as the inverse of the decision's risk exposure, scaled by the staff's current cognitive availability.

#### **Who Can Verify**

Floor Managers, GM, or Executive Chef.

#### **When HESTIA Should Ask Questions**

Only when the decision risk is high and the system's confidence is low5.

#### **When HESTIA Should Stay Silent**

During the absolute peak of dining service (e.g., 8:00 PM), unless a critical safety event occurs45.

#### **When HESTIA Should Escalate**

When human confirmation is requested but remains unanswered, and the system's execution window is closing.

#### **How Uncertainty Should Affect Future Recommendations**

Recommendations are paused, and a clear, single-action confirmation prompt is injected into the operator's interface.

### **8. AI Inference Boundaries**

#### **Why it Matters**

Generative and statistical AI models are prone to hallucination and overconfidence on out-of-distribution operational scenarios, which can lead to costly real-world errors5.

#### **Signals of Uncertainty**

Target scenarios that sit outside the historical training distribution; high reconstruction loss in generative modeling layers5.

#### **Data Needed**

Model training boundaries, real-time input parameters, and historical performance matrices5.

#### **Confidence Calculation**

Inference reliability is calculated using the Mahalanobis distance (![][image63]) of the input vector ![][image64] to the historical training centroid ![][image65] with covariance matrix ![][image66]4:  
![][image67]  
Values of ![][image68] flag the input as out-of-distribution, triggering high epistemic uncertainty bounds4.

#### **Who Can Verify**

AI Safety Architects or System Administrators.

#### **When HESTIA Should Ask Questions**

When the real-time operational state falls into a high-risk, out-of-distribution zone5.

#### **When HESTIA Should Stay Silent**

When the inference task falls well within standard, high-density historical training patterns.

#### **When HESTIA Should Escalate**

When the system must execute an automated optimization in an unprecedented operational context (e.g., optimizing kitchen workflows during a power failure or a major system breakdown).

#### **How Uncertainty Should Affect Future Recommendations**

The system halts autonomous execution, reverts to hardcoded safety-heuristic rules, and flags the recommendation as "High Variance / Experimental"5.

### **9. Memory Update Rules**

#### **Why it Matters**

Updating a venue's core memory based on a single outlier event or an emotionally charged human assertion can distort long-term operational baselines27.

#### **Signals of Uncertainty**

High variance in incoming transactional patterns relative to established graph properties27.

#### **Data Needed**

Historical belief graphs, real-time updates, and domain volatility indices27.

#### **Confidence Calculation**

Governed by an adaptive learning rate ![][image69] scaled by the source reliability score ![][image70]27:  
![][image71]  
![][image72]

#### **Who Can Verify**

General Manager or Brand Director.

#### **When HESTIA Should Ask Questions**

When an incoming update represents a significant, long-term shift in the venue's DNA or core operational protocols48.

#### **When HESTIA Should Stay Silent**

When minor, daily operational fluctuations occur that fall within normal statistical limits.

#### **When HESTIA Should Escalate**

When a requested memory update directly violates foundational safety, structural, or brand policies.

#### **How Uncertainty Should Affect Future Recommendations**

Updates with low confidence are held in a sandbox layer, allowing the system to run simulations before updating the permanent knowledge graph27.

### **10. Decision Risk Levels**

#### **Why it Matters**

Treating low-consequence mistakes (e.g., a slightly misaligned table layout) with the same caution as high-consequence failures (e.g., food safety issues or massive overbooking) paralyzes the venue's operational flow10.

#### **Signals of Uncertainty**

Divergent operational telemetry in critical performance and safety areas10.

#### **Data Needed**

Decision impact matrices, financial exposure parameters, and customer retention metrics41.

#### **Confidence Calculation**

Calculated as the expected utility loss ![][image73] of decision ![][image74] across possible operational states ![][image34], factoring in the probability of failure based on system confidence50:  
![][image75]  
where ![][image76] represents the loss metric associated with state ![][image34] under decision ![][image74]50.

#### **Who Can Verify**

GM, Legal Counsel, or Owner.

#### **When HESTIA Should Ask Questions**

When a decision with high risk exposure is planned, regardless of the system's current confidence score.

#### **When HESTIA Should Stay Silent**

When low-risk, easily reversible operational adjustments are executed (e.g., adjusting back-of-house temperature by one degree).

#### **When HESTIA Should Escalate**

When a planned operational or strategic decision is categorized as a "Catastrophic Failure Potential" (e.g., overriding safety limits or executing high-volume bookings with insufficient staff).

#### **How Uncertainty Should Affect Future Recommendations**

High-risk recommendations are subjected to strict verification protocols, requiring manual, multi-signature human approval before execution10.

### **11. Recommendation Confidence**

#### **Why it Matters**

Overconfident recommendations from an AI system can lead to costly mistakes, while overly hesitant, "weasel-worded" suggestions confuse and frustrate busy operators52.

#### **Signals of Uncertainty**

Wide variance in simulation outcomes; low input data quality; unverified assumptions5.

#### **Data Needed**

Structural causal models, simulation outputs, and historical validation metrics43.

#### **Confidence Calculation**

Calculated as the expected utility of the recommended action, adjusted for the variance in predicted outcomes:  
![][image77]  
where ![][image78] represents the variance of the simulated utility distribution43.

#### **Who Can Verify**

General Managers or F\&B Directors.

#### **When HESTIA Should Ask Questions**

When the expected benefit of the recommended action is highly sensitive to small changes in uncertain input data26.

#### **When HESTIA Should Stay Silent**

When the recommended action is stable, robust to variations, and clearly superior to alternative options.

#### **When HESTIA Should Escalate**

When the system's confidence in a recommended action is low, but external operational pressures are forcing immediate decision-making.

#### **How Uncertainty Should Affect Future Recommendations**

The system communicates the recommendation using clear, quantified terms (e.g., "Highly Likely / 85% Confidence"), explicitly listing the key assumptions and potential risks52.

### **12. Discovery Question Prioritization**

#### **Why it Matters**

Asking too many questions of human operators during a shift causes user fatigue10. The system must dynamically prioritize its questions to target the gaps that yield the greatest reduction in overall operational uncertainty22.

#### **Signals of Uncertainty**

Multiple high-impact knowledge gaps and conflicting evidence nodes in the system's core database22.

#### **Data Needed**

Information Gain Matrix, current shift phase, and operator-specific response likelihood vectors.

#### **Confidence Calculation**

Calculated using Expected Information Gain (EIG) based on Shannon Entropy reduction28:  
![][image79]  
where ![][image80] represents the current entropy of the belief graph state, and ![][image81] is the remaining entropy after receiving answer ![][image31] to question ![][image82]28.

#### **Who Can Verify**

FOH/BOH Directors or GM.

#### **When HESTIA Should Ask Questions**

When the EIG of a specific question exceeds a defined utility threshold, and the target operator's current workload is low22.

#### **When HESTIA Should Stay Silent**

When the operator's workload is high, or when the expected information gain is marginal45.

#### **When HESTIA Should Escalate**

When a high-priority question remains unanswered, and the corresponding operational window is closing.

#### **How Uncertainty Should Affect Future Recommendations**

Recommendations are adjusted to prioritize actions that gather information, actively testing the venue's state to resolve critical uncertainty.

### **Layer 3: Strategic Drift and Simulation**

This layer monitors the alignment between the venue's high-level business goals, brand identity, and the reality of its daily operations. It identifies structural conflicts and evaluates planned actions using predictive simulations.

### **13. Founder/Venue DNA Conflicts**

#### **Why it Matters**

Founders and owners often hold idealized beliefs about their venue's identity and performance that do not match the operational reality on the floor48. Decisions based on these flawed beliefs can quickly alienate guests and destabilize the team47.

#### **Signals of Uncertainty**

Divergence between high-level brand guidelines and daily operational telemetry; owner demands that violate safety, capacity, or financial margins47.

#### **Data Needed**

Founder/Owner DNA profiles, brand guidelines, real-time service quality metrics, and staff turnover trends47.

#### **Confidence Calculation**

Quantified as the semantic and statistical alignment score between the owner's espoused business rules and the venue's actual operational trends48:  
![][image83]  
where ![][image84] represents the vector of brand identity goals and ![][image85] represents the actual sentiment and performance vectors48.

#### **Who Can Verify**

GM, Brand Director, or Owner.

#### **When HESTIA Should Ask Questions**

When a strategic demand from the owner is projected to cause operational issues or degrade service quality.

#### **When HESTIA Should Stay Silent**

When owner-driven changes are cosmetic, low-risk, and do not impact core operational systems.

#### **When HESTIA Should Escalate**

When strategic owner demands threaten safety compliance, financial stability, or the core brand identity.

#### **How Uncertainty Should Affect Future Recommendations**

The system stops recommending tactical adjustments and initiates a "double-loop" update, prompting a review of the venue's high-level goals and operational assumptions47.

##### **Case Study: Capacity Growth vs. Service Instability**

* **Operational Context:** The venue owner demands a 25% increase in guest volume during peak Saturday dinner service to drive revenue growth.  
* **Divergent Telemetry:** POS data and kitchen ticket times show high instability, with standard ticket prep times fluctuating between 14 and 31 minutes during peak hours.  
* **Causal Mismatch:** HESTIA's causal models identify that increasing guest volume under these conditions will trigger a bottleneck at the main plating station, extending ticket times past the venue's 20-minute limit. This delay is projected to cause a 15% drop in FOH service recovery scores and trigger negative reviews7.  
* **Loop Action:** HESTIA blocks the automated booking increase, escalates the simulation results to the GM and Owner, and presents a clear choice: either increase kitchen prep staffing by 30% first, or run a controlled pilot test limited to a 5% volume increase10.

### **14. Guest/Service Conflicts**

#### **Why it Matters**

Trying to optimize individual guest experiences can sometimes create bottlenecks that impact the service quality of the entire dining room10.

#### **Signals of Uncertainty**

Real-time guest satisfaction metrics falling while table turn-rates increase; high plate waste; growing service-recovery logs55.

#### **Data Needed**

Guest profile data, historical transaction histories, kitchen capacity metrics, and real-time floor telemetry21.

#### **Confidence Calculation**

Calculated using the joint probability of maintaining individual guest satisfaction scores above 90% without extending overall kitchen ticket times past the venue's baseline limits10.

#### **Who Can Verify**

GM, F\&B Director, or Floor Managers.

#### **When HESTIA Should Ask Questions**

When a highly specific guest request (e.g., custom off-menu dishes) is projected to slow down kitchen execution during peak hours10.

#### **When HESTIA Should Stay Silent**

When custom requests are made during slow operational periods with high idle capacity.

#### **When HESTIA Should Escalate**

When a guest-service conflict begins to impact overall dining room service quality (e.g., kitchen ticket delays cascade to adjacent tables).

#### **How Uncertainty Should Affect Future Recommendations**

Recommendations shift to balance individual preferences with collective operational flow, suggesting adjustments to seating arrangements or menu offerings to preserve overall service speed10.

##### **Case Study: Individual VIP Demands vs. Kitchen Bottlenecks**

* **Operational Context:** A high-paying guest requests a complex, off-menu custom dish during peak dinner service on a busy Saturday night.  
* **Divergent Telemetry:** Kitchen station logs show 94% capacity utilization at the main prep station, with active orders queued for adjacent tables.  
* **Causal Mismatch:** Preparing the custom dish will take up a critical kitchen station for 18 minutes, slowing down food preparation for adjacent tables and risking service delays across the dining room16.  
* **Loop Action:** HESTIA alerts the FOH Director and suggests a compromise: offer the guest an exclusive, pre-prepared off-menu selection that does not burden the main kitchen lines during peak service10. This preserves the guest's premium experience while protecting the overall service speed of the dining room11.

### **15. Operational/Financial Conflicts**

#### **Why it Matters**

Maximizing immediate profits by cutting staff or purchasing cheaper ingredients often damages service quality and customer retention, reducing overall business value51.

#### **Signals of Uncertainty**

High profitability scores paired with declining guest retention, rising staff turnover, and growing customer complaints51.

#### **Data Needed**

Real-time labor costs, cost of goods sold (COGS), plate waste logs, and guest lifetime value (LTV) indices51.

#### **Confidence Calculation**

Calculated using Pearl's do-calculus to estimate the net long-term financial impact of operational cost-cutting measures51:  
![][image86]

#### **Who Can Verify**

Owner, Financial Director, or GM.

#### **When HESTIA Should Ask Questions**

When proposed cost-cutting measures are projected to push service quality below the venue's brand standard48.

#### **When HESTIA Should Stay Silent**

When adjusting operational budgets within safe boundaries that do not impact customer-facing workflows.

#### **When HESTIA Should Escalate**

When short-term cost-cutting measures are actively damaging the venue's long-term guest retention and brand reputation.

#### **How Uncertainty Should Affect Future Recommendations**

The system flags cost-cutting recommendations with warning tags, showing how short-term savings are projected to impact long-term customer value16.

##### **Case Study: Highly Profitable But Low Satisfaction Menu Item**

* **Operational Context:** A high-margin menu item is highly profitable but receives poor feedback in guest surveys and shows a high rate of plate waste.  
* **Divergent Telemetry:** Traditional financial reports show the item has a 78% profit margin, but guest satisfaction surveys show a negative sentiment rating of \-0.42.  
* **Causal Mismatch:** While the item generates strong short-term profits, guest retention analysis shows that customers who order this dish have a 40% lower repeat visit rate within 60 days, reducing their long-term value to the venue17.  
* **Loop Action:** HESTIA flags the item in the F\&B Director's dashboard and suggests a menu adjustment, proposing a revised recipe that preserves a 70% profit margin while reducing average plate waste by 30% to protect long-term customer retention16.

### **16. Reputation/Identity Drift**

#### **Why it Matters**

A growing mismatch between how a venue markets itself and how guests actually experience it creates "identity drift," which can lead to negative reviews and lost business47.

#### **Signals of Uncertainty**

Divergence between semantic concepts in marketing materials and the actual sentiment expressed in online guest reviews48.

#### **Data Needed**

Marketing copy, social media sentiment data, reservation notes, and online guest reviews6.

#### **Confidence Calculation**

Calculated as the semantic similarity score between the venue's intended brand DNA vector and actual guest review vectors:  
![][image87]  
Values below 0.60 flag significant identity drift, triggering a system audit47.

#### **Who Can Verify**

GM, F\&B Director, or Marketing Director.

#### **When HESTIA Should Ask Questions**

When guest sentiment reviews drop below a defined similarity threshold relative to the brand's intended positioning.

#### **When HESTIA Should Stay Silent**

When minor, isolated complaints occur that do not align with any broader systemic trend.

#### **When HESTIA Should Escalate**

When guest sentiment vectors show a sustained shift toward negative perceptions (e.g., a "premium fine-dining" venue is consistently reviewed as "casual and noisy").

#### **How Uncertainty Should Affect Future Recommendations**

The system flags this drift and suggests adjustments to service tempos, menu styling, or marketing messaging to realign the brand identity with the guest experience47.

##### **Case Study: Intended Premium vs. Perceived Casual Experience**

* **Operational Context:** A venue marketed as an exclusive, premium fine-dining restaurant consistently receives online reviews describing its atmosphere and service as "casual and loud."  
* **Divergent Telemetry:** Online sentiment analysis reveals a 45% drop in the use of terms like "exclusive" or "refined," with a corresponding increase in terms like "noisy" and "rushed."  
* **Causal Mismatch:** HESTIA's causal models identify the root cause of the shift: a recent floor layout change packed tables closer together to increase capacity, which in turn elevated ambient noise levels47.  
* **Loop Action:** HESTIA alerts the GM and suggests a layout adjustment to increase the physical distance between tables, helping restore the intimate dining experience required to support the venue's premium positioning49.

### **17. Simulation Confidence**

#### **Why it Matters**

Relying on uncalibrated operational simulations can lead to poor real-world planning, resulting in understaffing, kitchen bottlenecks, or lost revenue33.

#### **Signals of Uncertainty**

Divergence between simulation predictions and actual operational outcomes; high parameter sensitivity in modeling scenarios43.

#### **Data Needed**

Real-world performance logs, simulation histories, and parameter distribution files43.

#### **Confidence Calculation**

Calculated using the Wasserstein distance to measure the alignment between simulation runs and real-world outcomes44:  
![][image88]

#### **Who Can Verify**

Systems Analyst or GM.

#### **When HESTIA Should Ask Questions**

When planned layouts or staffing models show high variance in simulated performance outcomes43.

#### **When HESTIA Should Stay Silent**

When simulation models are highly calibrated and have consistently predicted actual operational metrics44.

#### **When HESTIA Should Escalate**

When a planned simulation shows a high probability of severe operational failure (e.g., massive kitchen backlogs or guest service collapses) under peak volume.

#### **How Uncertainty Should Affect Future Recommendations**

Recommendations based on low-confidence simulations are flagged as "Unverified," prompting the system to run localized real-world tests to gather more data before implementing changes at scale33.

##### **Case Study: Theoretical Layout Efficiency vs. Physical Bar Bottleneck**

* **Operational Context:** An event coordinator designs a new floor layout for an upcoming high-volume cocktail party that looks highly efficient in CAD drawings.  
* **Divergent Telemetry:** Spatial-temporal simulation predicts a 35% increase in guest density near the main service bar, with queue times extending past 12 minutes.  
* **Causal Mismatch:** While the layout maximizes seating capacity on paper, it channels guest movement into a single narrow corridor, creating a physical bottleneck that will delay drink delivery times and slow overall service33.  
* **Loop Action:** HESTIA flags the layout design as high-risk, suggests a physical adjustment to clear the bottleneck, and holds the layout update until the event manager approves the revised plan10.

### **18. Escalation Rules**

#### **Why it Matters**

In safety-critical or high-consequence operations, letting an automated system resolve critical issues without human oversight can lead to severe operational or brand damage7.

#### **Signals of Uncertainty**

Active operational metrics falling below critical safety margins; high conflict scores in primary systems7.

#### **Data Needed**

Real-time system performance data, staffing levels, and safety compliance logs12.

#### **Confidence Calculation**

Calculated as the distance between the venue's real-time operational state vector and defined hazard boundaries in the safety model.

#### **Who Can Verify**

General Manager, Owner, or Security Director.

#### **When HESTIA Should Ask Questions**

Instantly when an operational metric breaches a defined safety boundary12.

#### **When HESTIA Should Stay Silent**

When operational adjustments are minor and can be handled automatically within safe, standard parameters.

#### **When HESTIA Should Escalate**

When a critical operational metric crosses into a hazardous zone, and the system's automated corrections fail to resolve the issue within a defined window.

#### **How Uncertainty Should Affect Future Recommendations**

The system halts autonomous optimization, sounds an alert to the staff, and routes full decision-making authority directly to the appropriate domain manager10.

### **19. No-Fake-Intelligence Guardrails**

#### **Why it Matters**

Generative AI systems often hide uncertainty behind confident, articulate explanations16. This "fake certainty" can mislead operators into making risky decisions based on flawed assumptions3.

#### **Signals of Uncertainty**

Generative outputs that are highly articulate but lack supporting structured data; models expressing high confidence on out-of-distribution inputs3.

#### **Data Needed**

Model confidence scores, verification data, and system trace logs3.

#### **Confidence Calculation**

Measured as the semantic alignment and statistical truthfulness score between generated explanations and verified ground-truth data in the knowledge graph3.

#### **Who Can Verify**

AI Safety Architects, Platform Auditors, or GM.

#### **When HESTIA Should Ask Questions**

Whenever the system generates a recommendation or explanation that cannot be verified by structured data in the knowledge graph3.

#### **When HESTIA Should Stay Silent**

When explanations are directly linked to verified ground-truth data in the database.

#### **When HESTIA Should Escalate**

When the system detects a high-risk recommendation that is based on unverified assumptions or hallucinated data.

#### **How Uncertainty Should Affect Future Recommendations**

The system forces the generative interface to show its underlying data sources, explicitly flagging any unverified assumptions or speculative steps3.

## **Communicating Uncertainty: Words of Estimative Probability**

To communicate uncertainty clearly and professionally without sounding weak, HESTIA maps its internal, mathematically calculated confidence scores to a standardized scale of verbal expressions52. This scale is adapted from Sherman Kent's Words of Estimative Probability (WEP), translating precise numerical ranges into clear, consistent verbal terms52.

| Internal Confidence Range | Verbal Expression (WEP) | Operational Interpretation for Managers | Standard Communication Template |
| :---- | :---- | :---- | :---- |
| **![][image89]** | **Certain** [cite: 52, 54] | The parameter is verified by multi-source transaction logs3. | "Operational metrics confirm that table occupancy is at maximum capacity." |
| ![][image90] | **Highly Likely** [cite: 54, 56] | The assertion matches strong historical trends with minor variance4. | "Analysis indicates a high likelihood that kitchen ticket times will exceed the target threshold during peak service." |
| ![][image91] | **Likely** [cite: 52, 56] | Supported by positive evidence but subject to environmental noise4. | "Our simulations project that implementing the proposed floor layout will likely create a service bottleneck near the bar." |
| ![][image92] | **Chances About Even** [cite: 52, 54] | Data is incomplete or exhibits moderate conflict22. | "The chances are about even that the new menu item will meet its weekly sales targets due to limited feedback." |
| ![][image93] | **Unlikely** [cite: 52, 54] | Supported by weak evidence; contrary patterns are dominant25. | "It is unlikely that the current staffing model will be sufficient to handle the projected guest volume without service delays." |
| ![][image94] | **Highly Unlikely** [cite: 54, 56] | Almost no supporting evidence exists; contradicted by verified data3. | "It is highly unlikely that the proposed marketing campaign will meet its targets under current market conditions." |
| ![][image95] | **Impossible** [cite: 52, 54] | The planned action is prevented by hard system constraints. | "System rules confirm that it is impossible to book additional tables during this slot due to safety limits." |

## **HESTIA Uncertainty Reduction Loop**

The HESTIA Uncertainty Reduction Loop operates as a real-time, event-driven cycle. It continuously ingests data, audits its own beliefs, consults human operators, and updates its core models to guide decision-making.

ג”ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”  
ג”‚                              HESTIA CLOSED-LOOP CYCLE                                  ג”‚  
ג”ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”₪  
ג”‚  1. Input Capture (POS, PMS, IoT Sensors, Surveys, Staff Inputs)                       ג”‚  
ג”‚  2. Evidence Classification (Map to missing, weak, conflicting, verified states)       ג”‚  
ג”‚  3. Confidence Scoring (Calculate dual-metric interval boundaries: [Bel, Pl])          ג”‚  
ג”‚  4. Gap Detection (Identify null schema edges and evaluate structural ignorance)       ג”‚  
ג”‚  5. Contradiction Detection (Calculate conflict metric K; trigger Jousselme distance)  ג”‚  
ג”‚  6. Question Generation (Compute EIG; draft clear, quantified queries)                 ג”‚  
ג”‚  7. Human Verification (Route priority queries to appropriate domain experts)          ג”‚  
ג”‚  8. Memory Update (Execute localized Shock Updates to preserve graph integrity)        ג”‚  
ג”‚  9. Recommendation Adjustment (Update SCMs, apply do-calculus, shift to safety rules)  ג”‚  
ג”‚ 10. Post-Decision Outcome Review (Log real-world outcomes; calculate error gradients)  ג”‚  
ג”‚ 11. Confidence Recalibration (Update source reputations and data-decay parameters)    ג”‚  
ג””ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”€ג”˜

The table below illustrates the flow of information as it moves through each stage of the closed-loop cycle, showing how the system processes data and transitions between states.

| Loop Stage | Input State | Processing Action | Output State | System Triggers |
| :---- | :---- | :---- | :---- | :---- |
| **1. Input Capture** | Raw system signals and manual text entries6. | Captures data, structures inputs, and logs source lineage24. | Structured event payload. | New event received in stream21. |
| **2. Evidence Classification** | Structured event payload. | Classifies data quality and maps to the knowledge graph22. | Classified data payload3. | Completion of ingestion sweep. |
| **3. Confidence Scoring** | Classified data payload. | Calculates lower and upper belief bounds ![][image96]29. | Belief-bounded parameters36. | Class assignment complete. |
| **4. Gap Detection** | Belief-bounded parameters. | Maps parameters to schemas to find missing variables22. | Identified knowledge gaps22. | Graph update complete. |
| **5. Contradiction Detection** | Identified knowledge gaps. | Measures conflict ![][image5] against existing graph nodes28. | Confirmed conflicts28. | High conflict score (![][image23]) detected28. |
| **6. Question Generation** | Confirmed conflicts. | Computes Expected Information Gain (EIG)28. | Quantified queries52. | EIG exceeds utility thresholds22. |
| **7. Human Verification** | Quantified queries. | Routes query to matching domain expert based on workload10. | Verified operator response10. | Expert submits response. |
| **8. Memory Update** | Verified operator response. | Runs localized Shock Update to update core memory27. | Re-calibrated belief graph27. | Verification payload received. |
| **9. Recommendation Adjustment** | Re-calibrated belief graph. | Updates causal models and re-evaluates planned actions16. | Revised operational advice51. | Memory graph successfully updated. |
| **10. Post-Decision Outcome Review** | Revised operational advice. | Logs and measures real-world outcomes against models33. | Model error gradients44. | Action execution completed. |
| **11. Confidence Recalibration** | Model error gradients. | Re-calibrates source weights and data-decay schedules27. | Calibrated modeling parameters. | Shift or diagnostic cycle complete. |

### **Step 1: Input Capture**

The Uncertainty Reduction Loop begins with continuous, real-time data ingestion6. HESTIA captures transactional events from the Property Management System (PMS), real-time dining progress from the Point of Sale (POS) system, spatial-temporal data from physical occupancy sensors, and qualitative notes written by floor staff6. Every captured event is appended with metadata identifying its source, timestamp, and verification history to establish a clear audit trail3.

### **Step 2: Evidence Classification**

Once captured, the raw input payload is parsed and classified into one of the system's seven defined epistemic states: Missing Data, Weak Evidence, Conflicting Evidence, Outdated Knowledge, Unverified Memory, AI Inference, or Confirmed Operational Truth. This classification step ensures that qualitative assertions are not treated with the same weight as verified transactional records, protecting the system from data corruption3.

### **Step 3: Confidence Scoring**

The classified data point is processed through HESTIA's Dempster-Shafer engine to assign initial belief bounds29. Rather than generating a single probability score, the system calculates the lower-bound Belief (![][image97]) and upper-bound Plausibility (![][image98]) for the associated hypotheses, preserving the gap between them to represent the venue's structural ignorance29.

### **Step 4: Gap Detection**

HESTIA maps the belief-bounded parameters to its core schemas to identify missing information22. If an upcoming operational decision requires a relationship that does not exist in the graph, HESTIA flags this as an active knowledge gap and calculates its potential impact on decision-making22.

### **Step 5: Contradiction Detection**

If the new data contradicts existing information in the graph, HESTIA calculates the conflict metric ![][image5]28. If ![][image5] exceeds the threshold (![][image56]), HESTIA initiates Jousselme distance analysis to isolate the contradiction, discount the unreliable source, and halt any recommendations that depend on the conflicting data27.

### **Step 6: Question Generation**

When a gap or contradiction must be resolved, HESTIA computes the Expected Information Gain (EIG) for possible follow-up questions22. It uses Shannon Entropy to prioritize the question that will most reduce operational uncertainty, drafting a clear, direct query that avoids vague terminology52.

### **Step 7: Human Verification**

HESTIA routes the prioritized question to the person in the venue with the highest relevant expertise10. The prompt is scheduled based on the recipient's workload, ensuring that floor staff are not distracted during peak service hours unless a critical safety event occurs10.

### **Step 8: Memory Update**

When the operator responds or new verifying data is received, HESTIA executes a localized Shock Update to integrate the new information into the belief graph27. This adjusts the plausibility of affected nodes, resolving the contradiction without destabilizing adjacent operational models27.

### **Step 9: Recommendation Adjustment**

The system updates its Structural Causal Models (SCMs) with the new data16. Using Pearl's do-calculus, HESTIA evaluates planned interventions and updates its operational recommendations15. If the confidence score for a recommendation is low, the system highlights the risk and shifts to a conservative, safety-first strategy5.

### **Step 10: Post-Decision Outcome Review**

After a recommendation is executed, HESTIA monitors the outcome2. It compares real-world metricsג€”such as actual kitchen ticket times or guest satisfaction scoresג€”against its earlier predictions, logging any divergence to measure the performance of its models33.

### **Step 11: Confidence Recalibration**

Using the feedback from the post-decision review, HESTIA recalibrates its internal engine5. It updates the reliability scores of its data sources using the beta-reputation model, adjusts temporal decay rates for volatile operational data, and refines its predictive models to ensure the system continues to learn and self-correct over time27.

#### **׳¢׳‘׳•׳“׳•׳× ׳©׳¦׳•׳˜׳˜׳•**

1. Understanding Threat and Error Management | PDF | Air Traffic Control | Airport \- Scribd, [https://www.scribd.com/document/584577712/TEM-by-Captain-Dan-Maurino](https://www.scribd.com/document/584577712/TEM-by-Captain-Dan-Maurino)  
2. Integrating Threat and Error Management With Safety II Principles: Understanding Adaptive Capacity Boundaries in Aviation Investigation | Request PDF \- ResearchGate, [https://www.researchgate.net/publication/398940791_Integrating_Threat_and_Error_Management_With_Safety_II_Principles_Understanding_Adaptive_Capacity_Boundaries_in_Aviation_Investigation](https://www.researchgate.net/publication/398940791_Integrating_Threat_and_Error_Management_With_Safety_II_Principles_Understanding_Adaptive_Capacity_Boundaries_in_Aviation_Investigation)  
3. Beyond Prediction: Structuring Epistemic Integrity in Artificial Reasoning Systems \- arXiv, [https://arxiv.org/html/2506.17331v1](https://arxiv.org/html/2506.17331v1)  
4. Uncertainty-Aware Bayesian Time Series framework for probabilistic imputation | Request PDF \- ResearchGate, [https://www.researchgate.net/publication/398141652_Uncertainty-Aware_Bayesian_Time_Series_framework_for_probabilistic_imputation](https://www.researchgate.net/publication/398141652_Uncertainty-Aware_Bayesian_Time_Series_framework_for_probabilistic_imputation)  
5. When AI Hesitates: Methods for Identifying and Managing Model Uncertainty, [https://www.researchgate.net/publication/391702393_When_AI_Hesitates_Methods_for_Identifying_and_Managing_Model_Uncertainty](https://www.researchgate.net/publication/391702393_When_AI_Hesitates_Methods_for_Identifying_and_Managing_Model_Uncertainty)  
6. Bayesian Network Modeling for Probabilistic Reasoning and Risk Assessment in Large-Scale Industrial Datasets, [https://ijsra.net/sites/default/files/fulltext_pdf/IJSRA-2025-1765.pdf](https://ijsra.net/sites/default/files/fulltext_pdf/IJSRA-2025-1765.pdf)  
7. Aviation Threat and Error Management (TEM) \- Tilak Ramaprakash, [https://tilakramaprakash.weebly.com/tilak-ramaprakash-blog/aviation-threat-and-error-management-tem](https://tilakramaprakash.weebly.com/tilak-ramaprakash-blog/aviation-threat-and-error-management-tem)  
8. Introduction to TEM in Aviation Safety | PDF | Aerospace Engineering | Aeronautics \- Scribd, [https://www.scribd.com/document/71080023/MRM-Introduction-to-TEM-Draft](https://www.scribd.com/document/71080023/MRM-Introduction-to-TEM-Draft)  
9. Tilak Ramaprakash \- Tilak Ramaprakash Blog, [https://tilakramaprakash.weebly.com/](https://tilakramaprakash.weebly.com/)  
10. A Guide to High-Reliability Organizations (HRO) in Healthcare | GHX, [https://www.ghx.com/the-healthcare-hub/hro-healthcare-guide/](https://www.ghx.com/the-healthcare-hub/hro-healthcare-guide/)  
11. 5 HRO Principles in Healthcare & The Role of Communication \- PerfectServe, [https://www.perfectserve.com/blog/hro-principles-healthcare-communication/](https://www.perfectserve.com/blog/hro-principles-healthcare-communication/)  
12. Adopting high reliability organization principles to lead a large scale clinical transformation \- PMC, [https://pmc.ncbi.nlm.nih.gov/articles/PMC10291486/](https://pmc.ncbi.nlm.nih.gov/articles/PMC10291486/)  
13. The 5 Principles of High-Reliability Organizations (HROs) \- KaiNexus Blog, [https://blog.kainexus.com/improvement-disciplines/hro/5-principles](https://blog.kainexus.com/improvement-disciplines/hro/5-principles)  
14. How Safety Leaders Can Create High Reliability Organizations \- ASSP, [https://www.assp.org/news-and-articles/how-safety-leaders-can-create-high-reliability-organizations](https://www.assp.org/news-and-articles/how-safety-leaders-can-create-high-reliability-organizations)  
15. Tutorial on Causal Inference and its Connections to Machine Learning (Using DoWhy+EconML) \- PyWhy, [https://www.pywhy.org/dowhy/v0.7.1/example_notebooks/tutorial-causalinference-machinelearning-using-dowhy-econml.html](https://www.pywhy.org/dowhy/v0.7.1/example_notebooks/tutorial-causalinference-machinelearning-using-dowhy-econml.html)  
16. Causal AI Decision Intelligence: Why It Will Emerge in 2026 \- theCUBE Research, [https://thecuberesearch.com/why-causal-ai-decision-intelligence-2026/](https://thecuberesearch.com/why-causal-ai-decision-intelligence-2026/)  
17. Causal Inference With Observational Data and Unobserved Confounding Variables \- PMC, [https://pmc.ncbi.nlm.nih.gov/articles/PMC11750058/](https://pmc.ncbi.nlm.nih.gov/articles/PMC11750058/)  
18. Causal Inference \- The Decision Lab, [https://thedecisionlab.com/reference-guide/statistics/casual-inference](https://thedecisionlab.com/reference-guide/statistics/casual-inference)  
19. Causal AI: Use Cases, Need, Benefits, Challenges and Strategies \- LeewayHertz, [https://www.leewayhertz.com/causal-ai/](https://www.leewayhertz.com/causal-ai/)  
20. Full article: Causal Inference with Unobserved Confounding: Leveraging Negative Control Outcomes Using Lavaan \- Taylor & Francis, [https://www.tandfonline.com/doi/full/10.1080/00273171.2025.2507742](https://www.tandfonline.com/doi/full/10.1080/00273171.2025.2507742)  
21. AI-Driven Personalized Learning Analytics Platform \- ResearchGate, [https://www.researchgate.net/publication/399493130_AI-Driven_Personalized_Learning_Analytics_Platform](https://www.researchgate.net/publication/399493130_AI-Driven_Personalized_Learning_Analytics_Platform)  
22. (PDF) Detecting Knowledge Gaps from Conversational AI Interactions Using Curriculum Prerequisite Graphs \- ResearchGate, [https://www.researchgate.net/publication/406877016_Detecting_Knowledge_Gaps_from_Conversational_AI_Interactions_Using_Curriculum_Prerequisite_Graphs](https://www.researchgate.net/publication/406877016_Detecting_Knowledge_Gaps_from_Conversational_AI_Interactions_Using_Curriculum_Prerequisite_Graphs)  
23. Detecting Knowledge Gaps from Conversational AI Interactions Using Curriculum Prerequisite Graphs \- arXiv, [https://arxiv.org/html/2606.10736v1](https://arxiv.org/html/2606.10736v1)  
24. AI Researcher (AI-Oriented Knowledge Systems) job with GenScript | 3053502 \- BioSpace, [https://jobs.biospace.com/job/3053502/ai-researcher-ai-oriented-knowledge-systems-/](https://jobs.biospace.com/job/3053502/ai-researcher-ai-oriented-knowledge-systems-/)  
25. Analysis of Competing Hypotheses (ACH part 1\) \- SANS ISC, [https://isc.sans.edu/diary/22460](https://isc.sans.edu/diary/22460)  
26. Improving Intelligence Analysis with ACH \- Pherson, [https://pherson.org/wp-content/uploads/2013/06/Improving-Intelligence-Analysis-with-ACH.pdf](https://pherson.org/wp-content/uploads/2013/06/Improving-Intelligence-Analysis-with-ACH.pdf)  
27. Belief Graphs with Reasoning Zones: Structure, Dynamics, and Epistemic Activation \- arXiv, [https://arxiv.org/pdf/2510.10042](https://arxiv.org/pdf/2510.10042)  
28. Conflicting evidence combination based on uncertainty measure and distance of evidence \- PMC, [https://pmc.ncbi.nlm.nih.gov/articles/PMC4967071/](https://pmc.ncbi.nlm.nih.gov/articles/PMC4967071/)  
29. Dempster-Shafer Evidence Theory and Study of Some Key Problems, [https://fs.unm.edu/DSmT/DempsterShaferEvidenceTheory.pdf](https://fs.unm.edu/DSmT/DempsterShaferEvidenceTheory.pdf)  
30. A Networked Method for Multi-Evidence-Based Information Fusion \- PMC, [https://pmc.ncbi.nlm.nih.gov/articles/PMC9857947/](https://pmc.ncbi.nlm.nih.gov/articles/PMC9857947/)  
31. ML | Dempster Shafer Theory \- GeeksforGeeks, [https://www.geeksforgeeks.org/machine-learning/ml-dempster-shafer-theory/](https://www.geeksforgeeks.org/machine-learning/ml-dempster-shafer-theory/)  
32. Exploring the Combination of Dempster-Shafer Theory and Neural Network for Predicting Trust and Distrust \- PMC, [https://pmc.ncbi.nlm.nih.gov/articles/PMC4807071/](https://pmc.ncbi.nlm.nih.gov/articles/PMC4807071/)  
33. Digital Twins as an Emerging Solution in AI-Driven Modeling and Metrology of Industry 5.0/6.0 Production Systems \- MDPI, [https://www.mdpi.com/2076-3417/16/10/4942](https://www.mdpi.com/2076-3417/16/10/4942)  
34. Comparative Study: Digital Twins vs Stochastic Modeling for in-line Metrology, [https://eureka.patsnap.com/report-comparative-study-digital-twins-vs-stochastic-modeling-for-in-line-metrology](https://eureka.patsnap.com/report-comparative-study-digital-twins-vs-stochastic-modeling-for-in-line-metrology)  
35. Analysis of competing hypotheses \- Wikipedia, [https://en.wikipedia.org/wiki/Analysis_of_competing_hypotheses](https://en.wikipedia.org/wiki/Analysis_of_competing_hypotheses)  
36. Dempsterג€“Shafer theory \- Wikipedia, [https://en.wikipedia.org/wiki/Dempster%E2%80%93Shafer_theory](https://en.wikipedia.org/wiki/Dempster%E2%80%93Shafer_theory)  
37. David Riggs NeuralBlitz \- GitHub, [https://github.com/NeuralBlitz](https://github.com/NeuralBlitz)  
38. The Logic of Conditional Doxastic Actions: A theory of dynamic multi-agent belief revision, [https://archive.illc.uva.nl/KNAW-AC/MasterClass/rakfinal.pdf](https://archive.illc.uva.nl/KNAW-AC/MasterClass/rakfinal.pdf)  
39. The Consensus Operator for Combining Beliefs, [https://www.mn.uio.no/ifi/english/people/aca/josang/publications/jos2002-aij.pdf](https://www.mn.uio.no/ifi/english/people/aca/josang/publications/jos2002-aij.pdf)  
40. A New Combination Rule for Conflict Problem of Dempster-Shafer Evidence Theory | Request PDF \- ResearchGate, [https://www.researchgate.net/publication/283319111_A_New_Combination_Rule_for_Conflict_Problem_of_Dempster-Shafer_Evidence_Theory](https://www.researchgate.net/publication/283319111_A_New_Combination_Rule_for_Conflict_Problem_of_Dempster-Shafer_Evidence_Theory)  
41. Causal AI for Data Science Teams | causaLens, [https://causalai.causalens.com/causal-ai-for-data-science-teams/](https://causalai.causalens.com/causal-ai-for-data-science-teams/)  
42. Causal Inference in Decision Intelligence ג€” Part 11: Controlling for Unknown Confounders | by Eugene Zinoviev | Medium, [https://medium.com/@ievgen.zinoviev/causal-inference-in-decision-intelligence-part-11-controlling-for-unknown-confounders-5649db493cfd](https://medium.com/@ievgen.zinoviev/causal-inference-in-decision-intelligence-part-11-controlling-for-unknown-confounders-5649db493cfd)  
43. A digital twin-based method for predicting the burst speed of discs \- Taylor & Francis, [https://www.tandfonline.com/doi/full/10.1080/27525783.2026.2618283](https://www.tandfonline.com/doi/full/10.1080/27525783.2026.2618283)  
44. Physics-Informed Synthetic Data Generation Framework for Scalable Digital Twin Applications in Built Environment Monitoring \- J-Stage, [https://www.jstage.jst.go.jp/article/jsceiiai/7/1/7_87/_html/-char/en](https://www.jstage.jst.go.jp/article/jsceiiai/7/1/7_87/_html/-char/en)  
45. cluster-based specification techniques in dempster-shafer theory for an evidential intelligence analysis of multiple target tracks, [https://www.foi.se/download/18.7fd35d7f166c56ebe0b10091/1542623794239/TRITA-NA-9410.pdf](https://www.foi.se/download/18.7fd35d7f166c56ebe0b10091/1542623794239/TRITA-NA-9410.pdf)  
46. Revitalizing doubleג€loop learning in organizational contexts: A systematic review and research agenda \- UniPD, [https://www.research.unipd.it/retrieve/ea7bd412-d8cd-41cf-bc34-b8e539110a97/EMR_2023_Revitalizing%20double%E2%80%90loop%20learning%20in%20organizational%20contexts_Auqui%26Furlan.pdf](https://www.research.unipd.it/retrieve/ea7bd412-d8cd-41cf-bc34-b8e539110a97/EMR_2023_Revitalizing%20double%E2%80%90loop%20learning%20in%20organizational%20contexts_Auqui%26Furlan.pdf)  
47. Single, Double, and Triple Loop Organizational Learning \- Viewpoints which Matter, [https://chaturvedimayank.wordpress.com/2021/08/11/single-double-and-triple-loop-organizational-learning/](https://chaturvedimayank.wordpress.com/2021/08/11/single-double-and-triple-loop-organizational-learning/)  
48. Chris Argyris: theories of action, double-loop learning and organizational learning \- infed.org, [https://infed.org/dir/welcome/chris-argyris-theories-of-action-double-loop-learning-and-organizational-learning/](https://infed.org/dir/welcome/chris-argyris-theories-of-action-double-loop-learning-and-organizational-learning/)  
49. Double-loop learning \- Wikipedia, [https://en.wikipedia.org/wiki/Double-loop_learning](https://en.wikipedia.org/wiki/Double-loop_learning)  
50. LOGICAL DYNAMICS OF INFORMATION AND INTERACTION \- Bernoulli Institute for Mathematics, Computer Science and Artificial Intelligence, [https://www.ai.rug.nl/\~sujata/papers/johanbook-ch10.pdf](https://www.ai.rug.nl/~sujata/papers/johanbook-ch10.pdf)  
51. (PDF) From Meaningful Data Science to Impactful Decisions: The Importance of Being Causally Prescriptive \- ResearchGate, [https://www.researchgate.net/publication/370285062_From_Meaningful_Data_Science_to_Impactful_Decisions_The_Importance_of_Being_Causally_Prescriptive](https://www.researchgate.net/publication/370285062_From_Meaningful_Data_Science_to_Impactful_Decisions_The_Importance_of_Being_Causally_Prescriptive)  
52. Words of estimative probability \- Wikipedia, [https://en.wikipedia.org/wiki/Words_of_estimative_probability](https://en.wikipedia.org/wiki/Words_of_estimative_probability)  
53. SIAM Conference on Uncertainty Quantification (UQ26), [https://www.siam.org/media/xygnvalm/uq26_abstracts.pdf](https://www.siam.org/media/xygnvalm/uq26_abstracts.pdf)  
54. Words of Estimative Probability (WEP) in Cyber Threat Intel | by Chad Warner | Medium, [https://warnerchad.medium.com/words-of-estimative-probability-wep-in-cyber-threat-intel-21e5065035d8](https://warnerchad.medium.com/words-of-estimative-probability-wep-in-cyber-threat-intel-21e5065035d8)  
55. (PDF) Developing a Framework and Electronic Tool for Communicating Diagnostic Uncertainty in Primary Care: A Qualitative Study \- ResearchGate, [https://www.researchgate.net/publication/369116876_Developing_a_Framework_and_Electronic_Tool_for_Communicating_Diagnostic_Uncertainty_in_Primary_Care_A_Qualitative_Study](https://www.researchgate.net/publication/369116876_Developing_a_Framework_and_Electronic_Tool_for_Communicating_Diagnostic_Uncertainty_in_Primary_Care_A_Qualitative_Study)  
56. Perception of Probability Words \- Wade Fagen-Ulmschneider, [https://waf.cs.illinois.edu/visualizations/Perception-of-Probability-Words/](https://waf.cs.illinois.edu/visualizations/Perception-of-Probability-Words/)

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIIAAAAWCAYAAAAM9ESoAAACyElEQVR4Xu2ZTahNURTHl1CEpF4h6mEiRQZIyhARycBAoZQBAyNCJnolI7NHBgwkmcjAhHyVK5IyUkyUeuRjhFKUgY///629u/uud965+3Teue+m9atf59297jl3sNfeZ639RBzHcZpkdnCimAun20Gnv1kLH8NBG6jBdvgQLrYBpzlWwIvwEnwfvBU+02G4RYpXKJPgDVxvA4Hr0n5OdFuIzYDnTOxaiJF98GXy2WmYAbgLnoR/4Gm4O3gQPoJ/4Yt4QwJX7Rk4xQYCfMYx+EP0GYelvXNMg1vD+Ct4QnQniDDxboSr00POwtuiK9XCJOGELUzG5sMLMn4SpGyAv+CRZGwBvC/l98+Ed8PV6QGzRFc3J9zClXtTNBE4+ZGdcFPyuYw4oc9FC0H6QHQX6AYTiInk9IBl8DPcaANgERwRTYS4enm9ItWKuT2irx5eYxKU7QaRn1KcoE4D8LXAiebqTzkFf8Nn0jnpMXGqwt/4BlfaQAkt+ATOMeOWVdKubXJkXTQweqczCvv/lugkxa6BfoVPRQu4qfHLgTWiBWAVWPTxN2haK3SDdcs76axPivBEqAnbxy+i23YuVROBicTd5Z5oIsRaIYerkpcITk32ik7OiBkvI3YBObAOYD3AuoDtIhOO8u8cPBF6wDzR8wEmwiETKyN3Rzgg+n5P6wu+FqrUCi34Vjo7liLOS/vVkyOTMbfr+e+JE8rKfJ2JlcHVyVVqi8sU7gQ8GRw040vhB9HJ4GFUN5iobG3Z4joNcVx0Qj7C5SZWRjx34I5i4YEUV/pl0bbPFpq8547o736S7i0kuxMeczsNsBp+l7HbJcdzGRItNFOOythnppNYFKesU8aD7WtuPeFMAr04/mVdMGQHnf6DBd9mOziB8J9UVU4vnUmCbWFL8s8EqrAEvraDTv/CE0MeFu2wgRowwfZL90LScZy6/APNv6K95ZykHAAAAABJRU5ErkJggg==>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGIAAAAXCAYAAADwSpp8AAADPUlEQVR4Xu2YS8hNURTHl1Dk/cgjJFLyHojySokikZgoRgwYKEURiQwMzKRkQqIwkVKkZHDKgJBSTJT6SGTAQFHI4/+z7/nuvuvee757uheH7/zqX/esdc9rr73XWvuYlZSU/BlGSn28MSfDvKEkHwzgJm/sgTneIC5Ku6z9gPZKCMJNyzd406TX0iBnHyXdlfZavuv1ehisfdI978ign3Ra+iENdj5YJr2UFnpHSXNmSW+lzd6RwSrpm4VAjHc+IFCXpcTZS5owQeqSTjp7FqScs9IS6ZM0v9bdzWjpqYWgdAJS3nHpsNTf+f46PFych4dLY6S+kY3f2PB51luY1Ru9I4OHFuoDAfgoLah1d8NzUbgJdjtMly5YqEfbna8QkH+fS0+kydJy6ZX03sJM3WAh9/MC5Osv0sRfZ1Y5Jn2Q5jl7M5iJOyu/uRb3W1d117FfWuqNLcIEWmwh8Gsrx4WDLue6hUFgRvOwlyo+VskjC0HabdUXWG31KeiK9MIa5/lGsILS4sw5nLul6q6D58uz2oBgU6+eSbes4J3XSgvFcIeFQNy26kaKgUoq9vglSCHno2NIpAfSCGdvBOmNtjRliHTHwqxvBs+Z5ffQCr+TzklTnK/QUAy7rDYPp3mfl0lJuxgGJoaWNbHGLWhMWg+4rpcPbgzntRKIgxauf8Q7/hW+SjekAZGNvM8AxSmD2UU+HxvZIKkoKxADpWvSVu+wEARWo9/UpbAKWwkEDJUOSaes9VRZGBjw+EXTtMTsittKgsJ/Ya6FIgiJhVriAxRDAAgEAfFw78SaB5Iasccbe2CbhQbjqjTT+QoJ6YYVEXclMyzk2Djvs1pYNZ8tnMMspnADv99IUyvHjaARaLZXIBBZxZ4JsMYbW4AGg06Je6+oHBcWBoc6EBfkoxZ2vOx8U/CzCWOVJFbbwi6yECCKfgy15LvV1oJ4QM84H/JtcLo6G62kvEyykLL4AkAKKxTMEr/DZPb7TV4KGzo/s+i0KNi+znSCdHV2EoLAs/K5/r+DDRoDNts72oRP4TQIJS3CCrovnfCONmDP8dhCSizJQfq5pBOQFg9Y7SazJCfsQdr9WkohH+eNJSW/jZ/l/5RfcCO0AAAAAABJRU5ErkJggg==>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAWCAYAAACffPEKAAABS0lEQVR4Xu2XPyhHURTHv8Igyiglq0XZlE2iLCyMymg0/JSymshgMiiJwWC1GA0GFpOyWBgMBoMyIH++p3N+vN8Zn3fvU/d+6tO799xb73U693QfkClNF92lm3TIrSXBJH20cS+9oGc/q4kwTt8L8wN6V5gnQ7c9e6BVINWQLFP0hc75hVQ4hvaHZOmkYzZuo+uFtapY8YH/hCRgh86ba/SoZUc1zEITHJUN+kXf6L2NxQebL/5ujcYhNOlRkBd90GXabrF9+kmnm5tqYAt6KZPLWXCk9LbRWn4z0EpYLcT+Qn8JB6FH75pOICCS5VM67OJLqC4JHdAjVcYn6HdIIoIhXf7VB8mN2ecXInJOR30wBCP02QehPaLOS5BUz4IPhkKOwwn0Z0iQviA9omHjupDj2fymKAzQW7pHr+gl6k2AUEUvymQymUwZvgGnmz9cjnNPjgAAAABJRU5ErkJggg==>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAaCAYAAABVX2cEAAABB0lEQVR4XmNgGAWUghAgXgrEs9CwJ5KaeizyWIEuA8LA/0CcAcQBQCyCpCYNiL9B8QwGiHq8YBIDxDBGdAkgmAfE84GYD10CG9AE4rdA/BVN3AmIT6KJEQRBDBBXXYXyWYG4DIhXAbEETBGxAOZFkFeEgHgtEO8CYi5kRcQAXiA+zAAxLBqIr0PZ74FYB0kdUQDmRZjLQCAHyn8CxIpQMaIAzIuLgJgZKgYyAGQQSDwCKkYQCALxaQaEF2EAlDymQMUPIInjBbAk8QmI9dHkLIH4JxD/QxPHCUCxBrJ9HQNmzIGSRy8DRN6RAREEGABmKyzgYXgrVB7mYmS5R0AsB5UfBaNg6AIAvxpA9tWZAPEAAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIIAAAAWCAYAAAAM9ESoAAADF0lEQVR4Xu2YTYhOYRTHj3zkM5+R2IyURFkIJQuJkFhIUexZKAshS02yUpLJhiYLpGyEjSwmKQtfm5GVopSFpJSFfJ7fnHnM857uvXPf9x1m3ub86t+8c8577327z3nOxyMSBEEwWkxUzR/82yoTVHOlvXsEo8hkVY/qhNhi1mGGartqXmbj2qOq65kt6CAuq66KBURdulW/VTudnWDAN9vZgw7gjWq5Nw7DZ7FA2O0dYiXmpNTPLsEYgFS+2huH4ZCqXywQTjlf4rXqkkQwdAQzVX2qqc5exVLVE7E+gEC41uj+y0XVe1WXdwStQ6rNd9Yc1UJp7M75jA1fXdaqvnpjBfyGC2I9AAFAIBAQRbt+r5h/j3cEzUPDdU+sDvNSn6luDPoIjhdi9f2YDAXFDrHdWIezUj8QyB73xRYYKAn8pqdiI6NnseqdlAdKAt9G1b4mtGvgynHEVtVN1WGxl/5QhrrxlNax5y96nZSnaw/f++CNJRxR3ZKhySLteBabRfcsUL0S+4381jIiEGrAaIbYVb/Edntimdgi0pTlHBTb6Ynz2WcPgcBC1oFstCr7P2WpT6qVmT2RAhVVBULQBOyst6olmY3ay0L0ZrZJYhmETAKkbFJ3EZQSdnidQOC+PKtIlBZ6DU8Ewj+AF56Paekl+0UgG/DdFapHYl37D9UZKT72JSN88UYHvQj38qQegOcVnSUkP+WMU8gypov1QT7AqvRx4MpxBrvxu2pTZiMVk5LzRo0RkGbum9g1LPIdqT7uJbi4dxnU79OqK94hjYFQdJaQSlfRtUELLBIrDTRfidSo5dNBas7QBrEgeC7WaJZB/8F9iiATEAQ/xRpFDwv9Uuz6oj6EwCXIqp4fNAGpv1caJwNSPQu0LbPhPy5WLvpUm8VGS6aIMrrEyoeHzOLTcZ7e1xT4/c4nS3AM3eypZTDCkC1ui5WJ1DwWQTDl08hIQek64I3B/4ep4rHqnFQf6HAucFc1zTvagOc9kJgWxgwsRJ3F6Fft98Y2oEdZ741BZ8Ak0qOa5R1NMEWscdziHUEQtMkf3yqrLpnHkgYAAAAASUVORK5CYII=>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHMAAAAXCAYAAAA4JnCqAAADt0lEQVR4Xu2ZW6hMYRTHl6IIESJFpyORKIoouZQIDzwgKd558ERyeXLJg0RyKUmJkkghkQdp8IC8UlIKKUUS8YBc1q813/HNmm/vmXGO05mZ/at/58zae/bs+da3bntECgoKCmoxTDXAGxtkoGqINxb0Lv1Ux6QxZy5VjXC2DtVd1SxnbzsWqK6qXkfi9amy9qgmdp1dP/1Vh1TvVG/EFtyzWjXaG3PA+V9VM/0BZbbquTe2G1NUa1SHVc9UG8qv0RbVJ9Vv1dbwhjph4eeqfqhKUp0G2SAvnK0WU8XuZbk/IPZ5+8TSdtuzX3XUG5Vlql+qb/5AnbD4/ros/BHVLWfPg1R8Sex6K9yxQKdqkze2GxNUb8Wi1LNY/t2ZROMHqb7uZrHP43PrYaTqjmqhmDO3Vx6u4LvYPTfCWrEs8VistLD51otlpznReU1BcJhPhYNU18UWkC+ZxXCxBSfiYnDWfdXQyEbneUN1WzU4sudBij8hVoe5l7OVhytgk5Bl6oWIvyIW1S0BX55F8pwXsx8Uc6zngFjkPRLb1dTcmJVSnWLHql6pTjt7FtTWh+W/UMuZbB42C5umFqHONtJN92lCpIToC7qmOqea/PfUCmao7qnGlV+zMDg3hk2CQ2PoROlI81JlDPcS10HusyTVWSRwWfVUNcofSDBNddMbm5lQLxkhiJogRgnqzwVJz3WMAfHI4p3JYpekul7SieKQVc6eBYsdd6i816fuGKKWyOc71IINRf1uGUKK9ekQ6Bo5Fjcx7Hh2PvZ4LmWkiWsgEZlK3eGaWR1pDNfkXC/m1pARPDgzaxb1nBHbxPGM7bWj6+w+TpxiU5FCR+edyV9eE815ZNXhep05XiyNe3BUnrNwZp6zY0jhqZm1KQkpNjU+QJjr6GhDAxScScOTRUixnMeiLoqOzRN7kMADiSzCHLrTHxC7X97PdVI0kmbXiT1ObAlCKkzVIBb0p+qj2KOyQEizKWd2iI0PYZNw3Y1S2eyEzbArsnnmqx5I+lEfjsqLbEaekmQ3SDHU4qZvgKarPkt1LYr1RLLnQFp5mp2LYpHwUiyKQ2rDocdVX1TbpHL+5H9qVarjDM1REOkyMEn13h1HHlIw5aER+K507qxLPSNNS0IqGyPpOQ2npR4kABmBJ0pZqbI7sAE6vbEG3D+RzuNF3h9vlpPReQUJSJ9Ew25n7y7UdTJCagMV/EcYO2j9e5IlYr+sFPQy4VeQnooimpmSNxb0LtSkembCPPiBfa+ka3dBQXPwB7fF2tc6BDLLAAAAAElFTkSuQmCC>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE4AAAAXCAYAAAClK3kiAAAC6klEQVR4Xu2YS6hNURjH/0KRVx4pIV1JycDAY+RRHqEwwIyBGQOlCDESmYurJJKBiUzJQGwMyMiAFBmQKDKgKPfm8f/37dVd59uPs0/ndu+2O7/65frWPvtY3/q+tZYL9OjRJKbR8T7YIRPoZB9sMmPoBXSWuM10hostoA/pChevFVvpZXqVvqfP058Vk4foTDouHf9MP8Am59lFZ/tgCUr0D7rcD5BV9LUP1okldDe9Qd/Rfenf5Xk6AJvcNnqcDtIE2VZaRN+6WDuW0r+wxfMoqWdgrV9rlKQrPki20D/0Dd0Bm6iejdEkz9G7Ll6G2vkm7H3b3Vigjx7wwTqxkH6iy/wA2QmbXKi0r7AqjTkI+7zeUwW1/n26DvZuVXIRqviNPlgXQiVNd3FVUn869gyWnMd0SvSMTsDb9B6dFMXLOEIvwvZNvft663AL+s6zPlgX9A/TBDzatz7CVl3tlNemc2B7Y16b56F3Pk3/FO0Sp4XSwmiBaoU2+QTZxI2lr+g3DG3eekbVGaMTUYdHWbvF6KSO9y29M0H2sAncoi/pLD/gmIuhQ62KG9DZtSlD2N80AV03pK4bv+kxOjV9ThPL29+UVH1We2EV7qD1pNRnffvHqBpV0arsMkY8caFNtbJlqNJ8m4rQwkUnY8xe2LNeLdS86LkYJa7orjdqxG26v3UogxLs21RUTdx8+sgHYUkpS4wSV5bYUSG06U+60o3FhASrTTWB9dHYathV5XAU84R73gk/APt+fV7vyaNqq+q+6Su5TC1i0fbQlnANabf5hgTri1SZ8UGgZGrvOxnFPGvoE+T/d0xJKatYXXMSFB8eI4ouut+RXYWie5juW/30AT0Kq6CAfr6G/OSHgyOolgsspl/cuPSojff44P+EEqQbf5y0gCr3F4rbrRuU7D4fbApqwRf0lIt3y0RYpectVmPQVUN3wOFkE+w3KI0m/LZjuKpDl+TEB5vMJXR/51pLT6PLm32PmvAPvHK1MuMT/ToAAAAASUVORK5CYII=>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAAAXCAYAAABpskPJAAADB0lEQVR4Xu2ZS6hNURjH/0KRZ56REknJQFKUSImQR5KilKmUiQGmJncgEykpkQyEMkMGDE4oJXkUKZJHykBSikIe///99so6n3333ldrnwfnV//u2d865979/c9a3/rWvkCPHj26k6HUxOxnKkZRw33wf2I8zNQhfgBmzDFqH/LH/5Yz1EYfTMVS6iw1zg90ALqn89RD6i51tXm4n+PUKaSflbWZvp56Tz2jbrixTuAI9ZbaQX3K5HlOzfHBBNRiupbiC2olbJYcpGbGb+gA3lDXqQ3U9+x1zBTYfddBLaZ3Az+pXT6YMZpqUCNcPBXJTdcur1nSyQyjvlHL/EDGIuSXmxjlGX8p/rqI5KbfgtXKLS5+hzrkYq1mO2yGe92jJkTvU51XPA+Zu4d6TX2G5bSAegDbw3zeeSQ3fTE1A1Yj1Y8GlMTR6Hog9BltwlsHIXVJVdBMnEatoW7DNkldq22M6UP+TNdetZ86QY2EGay83sHy/gorSypPRSQ3XTe2ljoHW8YB3dym6Hog6jQ9oIRP+mCETNFq9cynLsH6ehFMPw3LW6993nkkN30WrDOYGsVUIxsonwGtQIZcpFb5gQyVjwvUKz+QQwNWUua5eBnJTc+rh+oStGQ7gUnUY2q2H4iQKVVMl+E3qTF+oITkpmvZxqZr2Wn5VSktQktYNdJvdkW63P/JamhWyqwio2TKRx/E784srFj97XifWgFb1WUkN12/MN6EqsysVrIOf65EzwFYS+nRKVafVY6hhsfdiup9W0yfTF2DPXNRG/US5Um2ilDP8wyNCfuSZyesVVTNfwJ7NvMBlusjVH9Gk9x0oVkQWrEr1Jfm4bYRVp1UhL4cdSF6v0elRU1CMFg5KteqByOR3HQdGEJnsBxmuJZdOxlLbaYWwmp1lfPCaljrWwfJTf8Bu1k9OtUB6Sna/7BLJjeo3bD9pkrd1UzWZNEhKDXJTT9MTafuZ5rbPNwWZLqO7nrErBOlyl8VVKe3+WACkpv+r6EWU/89KmoxB8teaokP9ugifgGEkaX+nh6MKQAAAABJRU5ErkJggg==>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHEAAAAWCAYAAAD3j3MyAAAED0lEQVR4Xu2YXahVVRDHJ0xQzMQSRVTU9EVLBKWkNILooRAl1AdFEUQkBUFQRCSJIHzwJUILyxJRiCRFn/oQRC4IKhSkD6Igwk3CKAlJUuhDc3539nDWGdc+H96rniP7B388rjl7nX3XzJqZtUQqKioqIoNVz6ieiIY2YI4RcbDi4cDCH1UtjoYGzFDNCWPM86X0LxC6mmliC3BZdaXQWdVe1Z5Cq1VP+wNtwFy/qP5TvRVs8J1qq7S++FNVV1XHVcOC7VnVJml9rseKUaq3VVtUd1TvqZYk+lz1v+qaP9AiLOYa1XXVH2LBkoL9jNjit8pusXfpUT1Vb+qDoHkpDjbgFbFU/NiwXXVY9WQ0iDmYxZsdDU14R+w55k7BgR+rxoTxRuDsg2Lz/awaW2/u403VP8W/rcKO3iC2ww8EW1cxRPWN2KJHfMFZPHZtO+wTe25hGB+n6g1jzSBVzlXdUt2UfEDxfudVX0k+GBvBjiQjnRbboYPqzZ3Pc6pfJb8wpCdS4u1oSGABcruKBWVe5k/BqTi3VZ5X/Sj2fjgQR75Y9w2DgKO+94oFyv2AA3Ek745TuwbSHYtK/fNmhsamV7VS7m0iAMf9K9b0eNR+L/W7OZdK2SGkbVJiK+DwY2I1kBTKc8y7PP1SwgIx+6JouE8+VP2melfy69ARsDg9Yn84i5TqJ9WfqmVSn16I+I9UHxSfnVOqpcVnnEWj9EbN3If/3g9hPMdosV3xavH/4aqTYu9Knc7B7/G7ZfZ2oV7ixE+lg8+idI10jygyQXVJbNHWJuMvq/6WWprEMTNVXxefweteTGvuRNQMgoRg8UBJA25nMRbxlNtfJxLE7MJt0l4H/Ujw+pTbGV5jsHM2czz9+rnyouozqd+t8yTf7RLNHC16wngOnMHv5LQ/+V5Kf504XXVErFulVHQ8I8WcV1ZDXhBrarCvT8ZZQMbK8G4XR7J7uJEZWth8N3G50IgVUnsmxY87PWHc8Zq4MRpKoLZTAi6IXT503WWBR23uMA4npLYL03rwfjEe4VZmlWq82E0NHSuOPCTmWIcgoGstY5JYN5rDnVjWGNHwYM/dEEVoVMgkn4iVjq5ks9gfTPOQOondws7Etk/u7cpo+bnBSW872DWkyYlSO7JwVbdLas2Owy6hs40w3yyxhgpFCIR1Yu/1e7A5pPqyoIxwI9Xx9a4Mb2a8vuT0l9hFc1l6eU1soTmOsFOJaE9/1MEdqm/F6os3O443RhG6yvQd4m6K73hDrKFyPFVz1Mml4ooBhm6XmjuQULdJ45OjoeLBQBpLjw8DwTmx67lWmS+1DruZOANPsccqUuhQSdkDAcEQG7BmUGPjBUeZuHjouvvUh8XrYs1IPE+2A43UF3GwoqKjuQtJrue6ZJpHqwAAAABJRU5ErkJggg==>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGYAAAAWCAYAAAAy/emjAAADZ0lEQVR4Xu2ZW6gNYRTHl1BELpFL1EFKCOUa8YbIJbcHxYOSToqEkJKUPEhJlAeRKFEkcolSxiUeKE9Snja5RKEURW7/vzXfnj3rfDNnZp+T9jjzq39z9rfmutZ8a61vjkhJSUnj0DNUW+gK9baDJfUzGboDNVlDCuOgaWaMQTkDbTDjHYrR0FHoGPQy1KXwN3UYmiv6FtP2CvoBzefBhufS0smt8Qa6BfUw4/2gh1AnM95h6A8tgXZAv6Dd0IpQa6Hb0G/oEbQO+gR9EA1oLXzL90o+R3YRPXcg/vQ3C5pqB1NYCnW2g0VnH3QN6mYNokGjA7eHW+5by0DomeQLCmfEXdHzvYAGx81VvkPz7GAKPO9+6B100NgKB9MI0wkDYOFbfUHUgefC7eLYHvr7pxlrja3QCegr9AWaFDdXeQqdFb2PPPCZOOMvQmMk30vTMIyA3kIzrQEMgSqiAaGTuB/3d/CBT4rWnqyMhR5DI0WDwuBMie0RwSagInof9cA0zftmvZphbA0PUxMdb9/KnaIz4QE0VPxpzAX1lBlPgrPrpkQ1hWmM511V3SPOIlH7Mmuok9OiDcca0YamYaGDAtGHd10Z9RG6Dy0QLagMGpuD2X+PimAK4ltvA5YE31wWdcc90Wv70ijh9XjdJHteDojWHzY5DR0YdlfssvjwabiUZlOKC0wWxzHtHQq3jkA0MGzLfeQ5fxqjRGcL645tzRsSphA6pmLGLaw/bAJsupsOfZNsjqOTeS2fklJhWwPDusJZyjrDelMI+oquT+iYZmOrhS00W2kGh6lvOdQ9tDnHHQ9/J7EaumwHJWrFA/GvZVyN2WINCXA2bBJNx+z6ColzalpXRFj42XVxvcLgnJdovcP1Bws4Z1MSw0S7MF9L7AKTtJZxM9r3pcHCNQzvc1f4d2HZJvrQr0VzcBKu8+oFHYFW1tjcGogzz8dE6EmoJmMj60Xv4T003tgImwrflwYfm6Ug9SOJCdBnaZnnOe6DdYWr6euiCzabcvaIOs/CjspeoxamP2u39xBANyRKnSU5oNOuhNv2hqlpuB0syQ7XJnPsYBsZIPrpJisbJb4WS9NVqI8e9n/DtUkg7fcPLp6PXx7ynI8plg1EFrE5KOT3s3rgSprOXGgNOWGzwfozyBpKSv45fwD9gcJSmJzqowAAAABJRU5ErkJggg==>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAZCAYAAAA4/K6pAAABGklEQVR4Xu3Suy6EURTF8SWiEIlLIyQkaJQK8QKiJSIKiWRaiUaFVqPQeAKNSuMBFOIFPIBCMzQ6CUFBXP7L/sQ5x1z6iZX88l32PvtkzjdSR2cYoxgsC+0yjVNc4Bh13KM/6WmYbmzhTbEwzRxuq2vTvOMa42Whygo+cIWxoqYBfGK/LCQZwqWiby8vSQuK6b62ypFigAdl2cUjZnCoxoP8zn0e4N4sPrQbxWfzvZtKi5Wf5yz+7XeYUgyoKYalvHhdsdhfKssSXtTmMyk28oB68V6TisJGWUjSizNF30lR+44LbnBjo8ziueL7PxnBOV4VZ5CmT7HBjuIf2zTefRtP2MQqDvCAeXT9trZOD9YUp76Miaz6n07LF+mXPNEtviQUAAAAAElFTkSuQmCC>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIMAAAAaCAYAAACU9O/tAAAEVElEQVR4Xu2aTahVVRiGX0nBSPqVQhOsBmKURURJOmhikYMy+pFCqoEDRyYkFgUNHEQDwdCRqCQOVLRJg34sgi4EkRUFUQRGUBEGhoZSIobV9/Tt7V7na9979j53b+85t/3Ayz5nrX3O3Wutd33rW+tcabSZZ7rWdEms6Pj/cIPpQ9NjpmdNX5ieTG/omP7MMb1vOmSaFeoeMN0XyqYSnu+6TPFZ2+ZKedREvJ6WrDD9ZVoTK+SdfsA0M1ZMEXeajpq2ySPZxWStaad84uwNdSMFs//WTJEXTH/Kl4eXVbh/tekR0/dyUwwDmOHNWCjPb3jme+T5ThNcHgsyHtQIm2G76TfTT6bfTZ+aFiX1NOwPeSN/NP2dKC+jo4eB8czwnelL+czleldvdS0w/hZ528sYWTOwrm42XZq958ogY467s7KXTGfkjYyR4WENf2SgHa+q2P3QZtp3x4U7+kM0+dh0Xt4XXKedGZ5TMcNzGHzKfjHdZLpGHi3KcgMSSJaKplklX57qEs1ws+mE6aqkDL5R0b66sKSOqQUz0NEzkvdkoXEPz2vK2shQSQ7jLGEQMMNp0+1ZGbOLzns0v8m4wvSB2snaGdSDKiJWVaIZGBjawgCmjGXlK0N5FVoxAx1MiP3atNB0r+ln00l5KCIEP286Jl/Pz5kW/PvJieFzDByhscpAzQ7vySHoKGbP3KScdfYz+Wx73PSJaVNS3ySY4A3V37ZGM+TGHs8M60J5FRo3A7PqLRXO/dy0P6sjWnCgg1E2qIgShGQGqh/vqVj3l4S6KpBs8fmNsUIexXhmjBxN1DT8jXfk/VGVumYYZClq3AyEJ7RPvodnoHNYx5jZ3yZlwD7/lVDWNCwDO1Q/PPeDDswTzzqaL89hnlC1KDeSZsghFP9guj4pe0j+oHuSMhI3EjjW+LZYZvpV7fzmsF6+1A2i4/Lta9mhV2SkzcBhztvqDbnMfh40bfyN8nyirS0cIZnvJxcAzLfcdPWFO6YGcqSPVC0qQDRDvwRyvAGdiNbMEN2Z/yEOeWhYDsbgXrhNPoubgoTwiHqjDiF6LLtOFeRVTJR0B9OPaAZ2Q+yK0kQYyMdOyNtel1bMwCyPGTt7dgY9TRSp5z60VJ5lR6ensN3jOwj5i0JdZKH83jLVblCD0DeH5RGxDtEMwLL7oootPFcOjdKdym4V7SY/mQj6jFPMp1QesQYyAw++R73nDJv13welnsyeaDGm/ttLtktn5TnGRKaBfE0t0yDraVMwgK+rt2+qUGYGvoOt+i757ytcn87Kc+jvU/JkvqzdeTSIfZQrjRIDmYFELTqL3IGtVFkncOjURnI3jNAP/YxcRpkZgD5lkJ4x3R/qUliOy8xQh4HM0NE845mhCkzA1zT5HVtnhiFhMma4Rf5ZEtfJ0JlhSMAM76r+fzpdZlqs8uW5Kizj7L7IRzozDAFLTF9l4vXFZKuKgzJed3R0dHR0dHQ0xj+X2AUwFyRTyQAAAABJRU5ErkJggg==>

[image14]: <data:image/png;base64,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>

[image15]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAZCAYAAADaILXQAAABU0lEQVR4Xu2UvyuGURTHj1AUyYQom8kmJAllsLBYDCYDi8ki/gObQSmDf8AoZTC8Wd96J0U2C2UzGCz4fp3n6NzzvqLnrs+nPvU859wfzz33PlekHJ1wAA7FRC47sAG34Do8hyNJi5KswrkQ64ZX8KJ4LkUXvIT9MQF24TuciQmjXXR586K15LuHsUe4CReLd3ogWp5P0Ulacg+f4Itow1fY5vIT8A3uFXmzBhdcLoEDHMPZEOfG3YmeCtIjOlCvNXBsww+4FBPWifLZmJTmDhvSXFfb0Jqk/b/hlx/BE9jh4iwDl73iYjzf17DPxdbgM5xysQRO4OtL+MWsIyfxHMIbuAzHi+expMUfTIsOPBoTuXDAB3gbE7mwlqwplzoYcllws05F7wrbMJZn+KdFBvuig/v74Uz0SGbB4+T/OrMure+Sf2M/URyY8qLihVVRUfELX48KP37iqL6eAAAAAElFTkSuQmCC>

[image16]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGgAAAAaCAYAAABb9hlrAAAEbklEQVR4Xu2YXYhVVRTH/2GJkfRNJWUzxoBE30RlEgWRoJQiGWgU2lvRS1BUr9NDRAQRFQQSDD1kD/oi9OGDyKVeJKVeFEUQxhCjwqSoKCNz/Wadzey7zsfcmdvcq3F+8Ofeu/c+9+x91tprrX2klpaWc5MrTRfExlmyyLQ4Nrb0z2WmDbExcI1pieny2JFxg2m36dHY0TJ3MM4Xqt89y007THtMH5kmTT+bLs3G5IyZjsTGIXKR6UY1O1YVC+QOeX/xORQwyiumvbFDPsEXTH/LDZNzj+m74rOKp00jsXHAsLaNppOmjtxpvjSNTg9p5LD8uq2mb02Pqd6J541bTD+YNsUOueH+lU8QL4yw4FOme2OHfFd+aLowdgwQQjbO9Yz8wTInwu8heShu4i7Tyuw31/9uWpe1zTvXy8PVu6EdWAzGeT12ZFxh2icfN97dNQWeOx4bB8gZeWjOneRm+byYdx0UOR2VnZIogoEvCe21XKXuLUeMJZETmhJ8p60q/uINPNzHY4fxiHyBfDbBLuE/qhb8lXyhw6rqmFcMzeSSY6ZfQ3sOBsWwXJvn2a9Nr2a/GyGsHDUdkMf6h0zH5cn7D9N6eYg6Ic8Vp1Xe1uwOJnpHaAcmkvreVrWhaGMcD6JqwSzwe9NNsWNANBkI52siOe8vpifl0YJCisgyIwz61LRW/if7TduKPnbVN3LjkeDTblqtcijDS5hsVYXCwlIf37lPFPdPc0ARjIez1BUSiavlDvXELHTb1JXNNBmoar45RKZ/1L3ei7tGNLCm0MdyT+DhJ/BWvJZEmPOUyvmkU6gqBDE2eT+L3CxfXC6Mw/8yeZJxJBmPz2HQj4HulOdPDt7sIHYS13ygWRQ+B+VJnmSfSFtzImvjDz9ROUxRWndUbSD+pxfvx5DcbzK0w/lqIHI2qSMvEkgPXPOX/FzUE3jtZ3IrJ9IDw7MTy+T56dqsDTqFqgzENfzPs7Ejgy2/Sz4OB4hQfJyrBqJkroMjB4aIvKGZn0kXDM6rilQecvO7s/YUhuB2Tdf3HXmuioZLcA0GqIu93IN7xfslUgFBOG4iVYyM7VXvTV3ZDOOiA1P0UNAQfepg3jh0JK23JwPxULkJCTaRPDYvBuhnHLrPtF3TO+ZF+S58oPgduU5e91MBkoNyOAtwLyrFvKzPoQiJcxwkL8kTPW8TgJA1YfpJfkCHZDDWsrBoSwfaseJ3gldddYf2EliTm1FtJF6TT2hV1kY/E8XyHXWX2sRStnKTR7B7Xjb9ZnpeXkG9KU+aD6v51cek6X01j5lPeJDMlVxK6N9p+lE+7wTOSnj+M2sDnBPHpI/nR0H2luqjSQm8NlqSrRwPrwkOqtHT8RQKhRgGquBexGbCJSXxaFdvNSwwrzCHxVK5Yz2o8jNrYlS+1i0aXh7Vc/JXH7fGjj7BSTB+Twe7lnrYcbzCeCd29AkxfqAvFv/v8OZ3JDbOAXYOhcPnsaOlf0ikPZ+Sa1ghryJ7fuPb0tLS0tLS8t9wFkHOAp4ytnNdAAAAAElFTkSuQmCC>

[image17]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAABMElEQVR4Xu2TvyuHQRzHP/IjRZGkRPmxmSgZFDIpg8XqXzBZbLL4OwySRZlkYDDyBxhFUorYKAy83j53up6+dF9Mule9err3c3efu3ueMysUCn9JZ6XdWCNTuye8+xGLeI8H2IXLeIUvIevACbzGB7zD6Y+RdaBJdnEV3/AM17DZfAHKtnAv9O/DSzwO7WzmccZ84A0OJ+9WzAtph5ER893vJ1kDzuFYkn2JBh9hW5Jpp0/mxxZZMi++joO4iRchW/js9Q3quFHJzs2Psju0m3AHn3HS/HhbcBwfrY5COsaUV9w2PxoxZP5DnJh/2zhxdiF9l+qxafUarEki+mFUfAoHsD/k2YVmzSdJ0Z2JK4+M4i0e4mmSZxfSBax1CdurAbRib3hGsgv9lv9XqFDI5x1Prjwim9WB0AAAAABJRU5ErkJggg==>

[image18]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAABYklEQVR4Xu2TMShFURjHP6EURZIIiYFMkiiFrFYMympUymKit9glE5MkizLJ4A2SgdFgVJISYqMw8Ps753Lfffe90C3L/dWv977vnPO+c77zjllKSkqS1ETi0pic4no/9ifG8AH3sRZn8Apffa4a+/AaH/Eehz5X/gL9yA7O4zue4yKWm9uAcpu46+c34SUe+vjHjOKwuYU32B4amzNXSCcM6DJ3+j0fN+ICruFsMKkYWpzFylBOJ30217aAKXPFM9iD69iCHXiEzV8zC6DFS5HchblW1vm4DLfxBQdwBY/NnUoopysoigqpjWHecAtLfNxm7g9xYu5udW+32OnHVXDDf49F9xJtm3b/hL2hnHar4oPYarlt0maWfb4gI5Z/ZL2ZYOcB3XiHB3gayotxPIvk8tADjHuEVdEEVJhrkT4D+s21sSGUSxy1atXcQxeZ76HkUBHd7TRO4KTlvrmUlH/kA9tdPMfLe1MhAAAAAElFTkSuQmCC>

[image19]: <data:image/png;base64,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>

[image20]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEkAAAAaCAYAAAD7aXGFAAACpUlEQVR4Xu2XTahNURTHl1Dks+jpYfAoJAqJFykllMQTilKUCenVm8iLDJQMGEgU8pGMZPImMjM4ZUDe4PWKjEwkQhJFJj7+/9Y59+673Hv3Ph/d7mD/6tfprrXvPvfuj3X2EYlEIpHupR8+hLeM5502y+F1k1/t5DtJL9wAe+AEk2sG25+Es2wiD+xkDxyGf+FVuB9udNosEB2YT/Ai3AmnOflOsRmOif4WXl81ppuyDv4U/W/v4Vvj8XpTP3vhB7jYJkRX0iicahMdZD38CiemnyeLDtaaWovm8H9xgFrJfoOYDhN4wcSvwXtwpolXAVciZ/Km+LcCJ+mL6ES5zJXWE5txB241sUnwhuggB5P9CLezpfCo1GeuKri9L8OPcI7JtWKX6KwnJs7JZXyHibsMwj4T2wcfi39yGjgkejPWHhbDg/BHQ4vysN8R+AYelnxbN6uXiYlng3TMxNuxAo6n11ywWPNms0W32J/0M5dlWbgSt8AXogW/yMr0DRLzoTyC52zQx1rRVcObcduRRfCdFOgshTXsFLwr2ldZqhoktn8KZ9iEDy5V3ui1E+PWuJLG5jnxUA7Ab6L1pwqqGqRN8L4N+uBg8OnFG/HqsjKNs/AVgTWH5xLWoWUmlxdf4WY+BD69z9igDz5CeSDjjWzxYz1i/LnkfAo4sP4MiN7jWfq5CKvgd/n/8MhVzqdyVibawSPHEwlfdTUuiQ7ES7jQ5AhP2MxzH883uSKwPrFO8Xw0ZHI+dsPfUn8V4fU03FZroQPB3/tZ9Ajjkg108CBlX2CHru6M8BBm81OcfBl4Pjorel4KrVsclBPwtuhrE6983bDvb7/gA9Gt6JKdBUO3ZtfA81ICl5h4O/gnj8Dtku/9kYPJJ3me81kkEolEIpFIxPAPLQaRYLLwlDsAAAAASUVORK5CYII=>

[image21]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAaCAYAAADbhS54AAABtklEQVR4Xu2UPShGYRTHjxgUIclHSCQySaIUMjJYMCgjIymLUvQuRiWZDEqSRZlkYJBBbAwWpZBSxEZh4P93zu297+O+H8vVm+6vfnWf89x7n3Of89wjEhEREfF/KHHG5QExjhnPdeKhMQSf4T4shZPwDn5YrBh2wHv4Ap9gz8+TIcJFd+As/IKXcMHmmDBjm3DXYtXwBh7ZODQGYK/oQg+wwTc3I5oYd9CjRXR393wxwp3Od2Iu83ANTsMiZy4pXOwQFtg4T3Qn30TL6DEmmmzMxuPwRPS+QosF0QZrYRM8hhewJuGOJHCxRd+4Al6LlrbMYkx2G77DLovxQ3LghqRObAVW2TWf5Tt4fNLCxFhWj274CbdEFyb1oj/AqejZHLQ4SZfYEmy2ayZ4K/pMSniu/GUkLOMrbPfF+IVMlknXSWIp0iXmwY9chlei70hJn/ze1jOJ74xHK3yEBzbvJ9PEhkXPV6M7EQQbpts02UyDFuKfx1K4f2AmiXWKtp1KdyJMMklsVbStEB6DWHwqPIISO5f4OeR5moAjcBSuS2J//FP6zaxjTrTFZB1TbiBb8BpzROh8A1CfSY4bOcg3AAAAAElFTkSuQmCC>

[image22]: <data:image/png;base64,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>

[image23]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAWCAYAAABwvpo0AAABqklEQVR4Xu2XPSiFYRTHj1CKfETka5AiJZRByWiTkgxmBqNRsSgZGCQiSSmbxSarUigrmSySoizKpPD/d+7NceK6rvfy0vOr3/Ce87xv9/k6z3NFAoFA4JUuuA3XnTOmTQtcdfkOk//TVMMBOAGf4RIcgt2mTa1op2/hHOyDhSbv4bv9Phh32PFdWGBiOXAYHsM2E0+XcXgNt2Czy8WKIrgPZ118GW7CYhf/CvmiK+xMdGXkvk3HA+7xO9hrYk1wRKL7wfzOkehAcEA4MLGBy5/7v1R01p8Sz3m2UcSw9tzAKUldT7JOGTwR7fCB6Kxz7/K51bSLGnaaA7AGS1zuR+mED6Id5lYgDfAKTieeo4QzvyDa+XKX+xXGRDt/bmKs/ouJWJWJfwd+c0f0VBiVX172SSpEixIHgANh4f5nnEdgpkuURygHcU8yO0azTg98FN0C3AoeFkM66BOfwNllHVmB9S4XK+ZFZ/kU1rkc4c0vWRxrXC4VvElO+mCcaIf3op2zJosg2Xgnb2+JgcDH8M/SBbxMw0PYqK/9H7hVeN6nY6VEd90OBNLgBUF+V2oRCePpAAAAAElFTkSuQmCC>

[image24]: <data:image/png;base64,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>

[image25]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAaCAYAAAC6nQw6AAAA5ElEQVR4Xu2TMQtBURiGv4GiTCZKYVUyK//BYmPzEwx+h5HUzWCw+AWGm58gg01kkUEZlAy8x3f09cXldJPpPvUs933Pe+rUJYr4K2W4gNsPrmAfJuyZtxRgD67hzXqAHhzACdzb72fYgXFzMIgRyZAPUyolKpHk5oLAsW9DhiZJZweLOmZchirwRNIzwy+4DGXhhqQ31DETZmimYybMkK9Si8tQjviRn72ujhmXoRq8EncusKpjxmXII+mYh47pmPk2lCTJlzCvY6I0rMM5SdH8Wy3YgG04hkebTWHmcTIi4sfcAaA7Xp7eSc6uAAAAAElFTkSuQmCC>

[image26]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAAAZCAYAAACrWNlOAAADgUlEQVR4Xu2YTaiNQRjHH6EIEQql3IRSSvKxwOImQj7yLWxuWZAspBBRZG2jJLKxIikrKal7YkNKkY+VBYkiKSGReH7NjHfO88577nnfm3Oven/175yZOc95Z/4z88ycI1KO+apuW6kMUU1RTfDvLUVxAw193mkrPePEtQ+1DdI6rhIpgxaqHqq2qI6rHqiWSbPBqbjBQMqgLlWv6oK4MT1S7ZBmg1Nx/WKdF0xVvVCdlvwq3a/6EJXjuMEEE743Ko9WXVMNj+pgleq7aoUv27h+Exu0R/VTtTRr/stc1eeo/L8Yu1y1KyoHJqleqq74so1rCauOHLlYNc20BWKDLqveqTao9onbHoj3K1WvVKP8ZwfKWFbgHC9ypsUadETc9j8h2Xi2qTapGuLMBRvXkvuq96o3ql+qs5IZE4gNaogzj/JX1W8v3nf7dgYGA2Esff+keq36Iq5vs5o+kTeIxUI/GVcYD6KONurBxhWCiRulOVfSKb50d1QXG8TsfhN3eFlmqz5G5U4by5ZmguOFMVLceG6oRvg6a9B6cavTMlH1THXTl21cEh5+R9xssPQD98R15LpqmK+LDZqheqs66csxHF4MLNCusfTFHhwxTPwY/9qKg5KttBjqSF/TfdkaRCokj4bxBji8fkhmuo1LQifPqG5LtnWhIa4jmF6UKzeL6+iiqI78zG3hcFRn44o4IK4f422D56jqqjT3MwUrFiPmmXrGw6HK4QopgxgP4wqMFefBRckmPRWXBHPtRZilT0dIEwFrEHFrVc9VM8XdFJ6otvu2gI0rghhWO+ZONm0Mijxn834RKfMZD+Nia0PKoHAvPyUupXH2HJLmnZSKawu2BAdYPHPQrkGWsnEY3CMu3ZAbL3lVhe/jvh2vOqhqUKU4HkwHtko+l5U1KFAljmezE26pzkvr3NsXLBDu3ExSTCWDpEIc6YA8xrUrxWrVGlvZBlXj7orrywLbUALu5fwKjHN+gFxL+ipLqThWCA9/LG4LAofIEsmfkp2AZzPJ/LJj5VYxl0OVe3nYfYyD8RQdjv+EHskfGmxfDoxOQx96JUtFmIq5ZeEPIW4IAa6TDf/aEbifxb80YpXNjf2Bqxonco/k8zvwT1M7KYXveSr5saCOLRSuJQ3JdwBxySdRd4pj4v57KKJLdU763sr8KrRjCaKtpqampqampqampibBH2LEuGZaLi+dAAAAAElFTkSuQmCC>

[image27]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAABWCAYAAABy68rHAAAHy0lEQVR4Xu3dT6htVR0H8BUWFJZSRhEVkmT0T0ICnSQ8IkUHaVRQlDMHNXijEIMmJtGkgURCgZSvBoE0yCSiQgcXGwgGzWykRE6iIMIwSKM/69s++91919n7nHPvPffWPufzgR/v3bX3OXe90fuy/pYCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMzH62t9uG0ccXWtp2q9un2wRXfV+vRI3VbrmsF7sWm/AQBmb9Pg88Va/y7d+2fl+Vp/Kt3vyZ8vLOqVRdubDl/duN8AALO3SfB5Va0/ly40va151np/rZ/XerLWw7Weq/XXWlcNX1rhC7UOynIw/HLp+vC+xc+b9BsAYCdsEnxuKYcjbH1gGpNg99tatzbtmc5M+6rPRj5/qdbX2wdFYAMA9ti64HN3rcdLF5QSmD529PFlCVuPtI0Dr6n1w7axkX78rdZ1Tft9pQuL1w7a1vUbAGBnrAs+v6p1c+mmQn9f6+NHH1+W7/lJ29jIKNkqny9H18klBL671r9qPdS/tLCu3wAAO2NV8Lmx1jsXf897B2U6dG0jsP26dIFt6HWLtqyLG1rVbwCAnTIVfDKF+aPSjaylMtL1dK3vDl8a2EZgy3ToH9rGMh7kpvoNALBzpoJPzlxrNw8krB2UwynLodMGtkx/JpSNbTjItGyevXbQNtVvAICdMxV8Es7aQ3ITuBKe3tC0x2kD25tLF8rubB9ULxcjbACw1zKy81gZHzUauqJ0oeKsJBxdLF1/ztMw+OTfeHvpzk67oXTTor1Mi95bugNtbyrL/TxNYMt331/rmVrXL35O3VPrxVoPlm4t25DABgAzlFPw2yuN+loVxj5Vjh4XMeUzpVtjdVxvL8v96evC4Wv/9UTpjrA4T8PgkyM7MpLV1x39S0176kODZ3HSwJbvab+7r5dqPVqWw2EIbAAwUx+p9Y+yfEDrA6ULAO9o2rOoPrVOv74qdVL5bBbPD7130f61xc/5Pfn7Wy6/cfbmGnzm2m8A2Hu51igBqF1jlam9S7W+WY6O1uTKpEwBrvOBWn8vpw9s6UMr7c8Ofv5g6W4VOC9zDT5z7TcA7L0En6lQlf/cM6XZ/yefqcpvHT6elJ2S2TH5gzL93evk5P7h7+69tRwdYeuNvXtW5hp85tpvANh7CTq5PmlM/nNPOOrXZWW9Vk7WX6c/3iLhLp8fHi2xqex8zHToGwdtGfXL5eg5EPbqQXvkZP+MFp6HK8vyerQ5mGu/AWCv9evMpkbNvlKOXh6eYyvWjdDksNhMh8aXSvf9GRU7jowEHZTDNXB9pW0qcOQKqJ+1jQPfr/XCBvWbWu/pPgIA8L/Xn+P1yfZB6UbFEoAOyuGO0Uxx5uiIKTlm4zuDn3OHZr5/1WfGZDo0p/e34SwXoef7hkdn9DIad9A2DuTf0B99saquKeM7LONCrW/vSF0oAMAsZApx6lDXi6ULR/29mAkxCUyrwtcvS3fmWD9alb/nO9aNyrVycv/Y2rd+5C3BsXWwKACAnZHRtWw4GBtdywhWAtN9TfuqKdEEu/ZZwl2mKsd+xyqZhh07v+3u0vXrlvZBMSUKAOygqfPXrirdCNZXy/LUY9ak5XOtjL61x39EH9iGh7/mOzPd+YlBWyuhrD1/Lf5Sumft74mEvKm1eAAAs5J1YTlLrV3Qn/pnrc+V5SuNeu8qy6Eoo1r9558s3U7EGDuNPzKtmR2dzy9+HmrfH9YfS/f7pyTM5Ty287Dp8RjZyfpUWb5fdJvuKsu3QaRuK916vKFN+w0AzFiCR3vUxklkzVzWw21LNkj8okwHzW3bNPjkMN+EzX7TxllI8O3XCg7XD76yaMv1Y71N+w0AzNxPy2ZXU63yQNnezQSZHs0huu1o0lnaJPikX5mmTWia2qiR7znJXaKtbB45KMvBMJ8dHsuySb8BgB1wY+nWoJ3Gj8vywbcnlTPfxqZXz9ImwScbI/oRtnadYG8bgS3B8FLpdta2BDYA2GMJCY+V5RGd85Yp2otlfBPCWVoXfLKb9fHSBaUEptwQMWYbgS39yI7a65r27PBNWLx20Lau3wAAO2Nd8MnZdjeXw12yOUB4zDYCW64KG66TS3jNbRPZ2PFQ/9LCun4DAOyMVcEnU8b9YcN576BMh65tBLZsAklgG8rmi7TlztWhVf0GANgpU8EnZ8xlQ0Z/zVVGup4u3YHDY7YR2DIdOramcCzITfUbAGDnTAWfnLl2a9OWsHZQxtf7nTawZfozoWxsw0GmZfMsR570pvoNALBzpoJPwll7SG4C19R9rQlcD7eNA3n+SNs4kOvFEsrubB9ULxcjbADAHhsGnytq3V7ruVo3lKPXeWVa9N7SHWh7UxnfzZq2J8ryLQ753t+V7nNj8t3313qm1vWLn1P31Hqx1oNl+SBhgQ0A2BvD4JMjOzKS1dcd/UtNeyrXdY35aK1na32j1mdrfa90V3FNXUI/du1XXy/VerSMh0OBDQDYG3MNPnPtNwDAsc01+My13wAAxzbX4DPXfgMAHNuVZXo92v+zufYbAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAmK//AEPyiglACZX+AAAAAElFTkSuQmCC>

[image28]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAABBCAYAAABsOPjkAAAFiklEQVR4Xu3dXYitVRkH8CUpGKlpSioVHRO6SbQIFcUPqJQihMzCIAjBj7oIRQVF8EIQLwRB8RMsOKRYCQVdJEgGHjJQ8UICxQsVEkQvg1Chgmr9Xfv1vHudd8/smTN73AO/HzycmbX2mdmz52L/edbHlAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwpxwxK1bnU/0AALB+EoiO6gcXyOM+0Q+u0Bm1Pt0Pjhxf65jZx8Ld9tzVDwAA6+XUWm/VurWfmJDg9Gqtk/qJFcn3+2M/WFpovKfW5aWFx9QHtf43ftAedFmtH/aDW3R+rR+V9lq8U+ubZT6MX1Ha7/CxWj+YjX2y1nkfPQIAWDtfr/V+rSfKxt2pvOk/WuupWkd3c6vy7Vq/6germ2v9sxv7TWmhbS/KkuQNtfbX+nw3t10JbC/1g6V1I58th/6uH5wYAwDWRJbDXi4tAJ3VzQ3yRv7fWf24m1ulv9Q6uR8sLYz0Qe6npQWevSRdrnTBVrGHLK9Rgnjvb7W+0g+WFtjyGgIAayjdlmtKe4OfCmMJa1fVeqDW27UumJtdrTv6gZk81ze7sXQKU3tBli2fr/W9svzewa1KWEvAHsv3SndySpZEf9cPAgDrIW/SR5YWgrK3qfeP0pZCs78qj9lo/1qCSPZFbVbfLZt3lbIcmuc15felPZeh3pifXlrCaJ7PRf3EyBf6gW1KWEo3LV213ZBAO97Tt6/Wi6PPp/y8WBYFgLWTvWjDMlg6Mv8ZzcU5tR4vLVzdVFoAGE5kTtmpwJag9ut+cCSb5H9S5kPb1+YesbkcaPhtaSHq37WuLNNh5c5+YJvynNOhvLufWJEDZT6wJXTfNvp8ymmzAgDWSDoqQxcre9nyBj9coZEOTfaQDbJnbBwAVulbpR0i6OU06An9YPXLcuiets3kkMX4upBTav159u/gM2U1y6xZCk0389wyHRJ3wvD7PLa0gwwXzk8vdH8/AAB8fBJWxoEse9PSYctepq/WeqXWF0fzB8ruBbZF13kkPP2hHyztSpJlriUZu7YfKK3r916t+2pdX+vvZXWBKl/3T6UFt1XsYxs6olnSfaQs93Oke+p6DwBYI8/W+lk3NtzflbDWyxURuxXYIhfm9idEs9/utW4ssqw53u+WAPRCrYtHY4cjnb2naz1Z2hLxifPTHwbMh2t9uRtfVr5elkpvr3VcaZ29/aWF04THKZeWxQcI4uzSrjnJcu8l3dyUBLoH+0EA4OPxeq3rSrve4bPdXDos6bqNlwUHz5WDHZvsbVu1BLAcPBhLNyrPIfvBBvtKW8ocy/UkeVxC2+FKkLmltFCWj/M6ZJlx7Dulfb8s4y46KLGMq2vdWOuZ0r5nAutUQE0nMD/zv/qJkS/Vere07toyzyl71/7aDwIAuy+BIx2XhItllsjGcmN+Nq6nA7RbsiyaTtvg9Nm/+0rbB5aTq323a5C9bjtxTUWWWnNYIE6q9f3RXC+BbaNDGcvI/x8uMc5evv76krHsU1tkKvBuJK+V5VAAWBNZLtzob3OukztmtR0Jels9iDAlX2Po4GWfXy6dPfPg9Jx7+oFtyJ8Ky/6zSCDLX5aYuug2sjy7UxLYxp1LAIClpEu03dCV7tzhdrsiJywT2H5R2jLlQ7W+MfeIg8umGy095jEJY5tVnvOB0g493Fvaz9EvXUcOhGz1KpNFPldc5wEAHIaNLtDdyE4u3ebQwXCScyoEJowt6oJtR+7HG5Z6F3VDszy7U3LYZKtL5AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwZv4P0da5/0D7Ot0AAAAASUVORK5CYII=>

[image29]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAaCAYAAACHD21cAAABBUlEQVR4XmNgGDZAEogFkPiMUIwTyADxKiB+AsTvgPgOENsDcTAQsyCpQwEmQPwKiCdA+SAb3KFi/2CK0AHIpusMEE3oTmoA4t9oYmDAC8SHGSDOAxmADnyBeA26IAiAAuIhEP8H4gQGTBs1gdgKTQwMOIB4KwNEIwifB2JlIGZGVoQL+AHxXwaEZhD+CMThDJguwAlACvOB+CsDxIA5qNIIAHIqNpDDANG4EF0CBkChhg2AxEEaJ6FLgAAoKnBpjGaARLwHugQIBAHxewbM4F4MxLeAWB5NHA5AzkgF4m9AfBqIZzFA/HQMiBUQylABKJ4soWxuIHZjgDgvhIGEKBgFQxMAAGxxLEEPshtkAAAAAElFTkSuQmCC>

[image30]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAA20lEQVR4Xu3SMctBURjA8SMWUdgUklWyWO3sJouBZHkzyWyxGSQfgMGgjD4B38HMrCjZ+Z/Oea/jTFedt95y//XLvc9z6+Z0hQgKCvrOzrjjggdi72uvLEb20E851BDS9wXskPaeeFVH2x76qWsPaIIDysYsgTVKxsx3Y3sg1L9q4YYl+jhiqHcf17EHRkVshXpBE+G37R+XR0Nfy+O7GjsnyeOaIq7vqzi91m7KCHV8v/WwN+6dVBHqg5BFsMFMqE/fWfK4fjDAHCssEDWecVZS/8qXpsxF0P/uCfNMGunflHdgAAAAAElFTkSuQmCC>

[image31]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAbCAYAAACqenW9AAAAvUlEQVR4Xu3PsQpBURzH8b9QBsWgpJRXIFEewiyZPYNsRrPUnQ1SUt7AZJDNgOIZjMTE99x7j849984s91ef4f8//87/HJE4/0oGWbsZlS1OOMBBH6nAhJ8mhkgigSne4m0KpIyzBNe3xRsOZSThg0FETwo44mb01DtXVs+NXjc3eg08MEEXJX1Qxx0zv1afUx9VF/SwFG+7mxx2WPuDHTzxQgtjPahTxRUbLFDDBXtUjLlv0shbddGo4/woH3oEICHIxjH1AAAAAElFTkSuQmCC>

[image32]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAA7UlEQVR4Xu2UraoCQRiGP1HDQRHFJAYxWcRisJi8AYPFbDnlgAYxeQcWEY2ixeYVWK1Wo6A2k+AVnOdjFlynKOwsGPaBB2Z4F15m50ckIuIDKjjAtB0EIY4tPGADY69xcNp4xB3WrCwwP9jDFZatLDAp7OMNF1bmBC24iinRcWjkcSJmJWMrc04GR2IKtThUdPP1Fy4lhAPgJ4ldPIm5iKGjF1EvpJ68LJaw42VVvHtjZ2jhVJ7PSxMvz9gNRTz75r+4982dUMeHN07gFmfy5oDo8gsfqvuh3//hEOe4wbWYJ8k5Wqhoac4fRHw3/wGPG8wRuseoAAAAAElFTkSuQmCC>

[image33]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADUAAAAaCAYAAAAXHBSTAAAB8klEQVR4Xu2VTShEYRSGj1CK/JafKCUlJRZCLCzEQiJhQZZ2sle2UljYKpGy8ZtsbGQxVspOUTYKiSykxMaG9+3Mz71fd+7MmDtj1H3qqbn3O7c557vfOVfEx8fHJ4PIh93mzSTIgvXmzXRRBpfgCyw01pKhE+7CbHMhFXAHO+A1HIa59mVPyIEHsNdccKNYEk+G8SyCxZxLanewGt7BCuO+I/3wCV7BVzgtuvOxYL/wuS3YYKx5ySX8dnDQGmSlD77BnuD1IrwR991gMYxjv1QZa6mgXPR/2KMshr+ZX9RTFRAN3BY9q2zwAmuAC4xlYSuS+uLq4LPoMY/JvNhfKXcj6g44wLc2JXoMD401L2GLML9Nc8EJFjABT+GX6IPjtoj44IAYEB0WXcFrL1kQzW3SXDCpFA0KDQUmwgdnwxGJ0wxPxNvRznYIwE/YKprvCKy1xIRZhy2W61K4Jt4kEoJ9NwZHRacYE5mBj7DGEudGo+hU3hHd+H3YbouwwD/gpNuAR/BdtEe8htOLn4vQCeBROoZ54Qh3uMmr8APuifaXK/zgxhyRSTIkmlBb8JoFzUWW44a5un1q0grf0K1EEroX/Xzwg10UCvpr2Atn8CFOl+EFLBFtco7/JtHPScYU9RtYDIcG+4jH/F8X4+Pj80/5Ab24V5SZLeZjAAAAAElFTkSuQmCC>

[image34]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAaCAYAAACO5M0mAAAAm0lEQVR4XmNgGAW0AsxALAbEwkDMiCYHBzlA/BaIDwHxFSC+gCqNALeBWBXKlgHiI0hycCAJxL+AeBIQawMxNxCLoKiAAhYg/o+EPwKxJ4oKJFAIxJeA+C8DRPFVVGkGBjUGiJUwIATEhxkgHoMDkJXLGVAdbgbEz4E4GEkMDAyA+AYQzwLifUD8CIjDGXCEI0gQ5HO8AT0KKAMA0PYZLAbjc+QAAAAASUVORK5CYII=>

[image35]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAeCAYAAADgiwSAAAAAo0lEQVR4XmNgGOpABV0ABhSBeCG6IAy0ArELuiAIcADxViCWRhbMA+L/aPgnEFuCJHmAWBKII4D4H5QtBsTMIEkYKGeA6MIALEC8Boifo0uAgDgQ3wXiA2jiYGADxL+BeBK6BAgUMUDsC2KAWAFynDBIAmbfWyDWBGJjIF4MxJxgbQyQIHvIAPHGKiA2g0mAgC8QfwTiDUDsiSwBA7DAGAXIAAD8ORoJ0Ewr5QAAAABJRU5ErkJggg==>

[image36]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAZCAYAAADXPsWXAAAA3klEQVR4Xu2RrQoCURCFR1BQ0CaCzWAziF0fwGCx2kwmgwbtYhfBYjMYzGI1aPUlfAWr+HMOd4W7w3V3xXo/+Fh2zmV29o6Ix0UKTuFaqelLOB+GY8MWvuBGBxZ7mNdFm7mYJgeYVRmpwIYuakZimpxhQWX85UXwjKQjpskVllXWgkdVc1KHN3iHTas+hiuYtmpf4dc5BafhVKQGL7D6ORQH74H3wSYTmIE7OLAPxcGNcDNssoTd4D1ypS44AZuc4EwSbMNFT0yTJyypLDFtMU0eOviFnJi7KOrA4/mXN4c7JorYOgWqAAAAAElFTkSuQmCC>

[image37]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAABBCAYAAABsOPjkAAAD7klEQVR4Xu3dXaisUxgH8CUUJR9RKBL5SBQiIrmiSCSuxMW5lJRSPnI1JbcKFz4iSZQo5OtGbE5JueGC5CMRKUK5JI7nae0xa9aemT0zewbnnN+v/rVnrXdmz15XT89a77tLAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAfsacfAABY1GH9wBQHRg7uB/cjy6xTvue7Zg4AYGFPRzbK9sXIAZE/I5f3E/uJZdfp2sjFo2kAgMVk8bFRagfohPGpLW6I/Bw5s5+YID/3wsh1kdO6ub3RTtbpociho2kAgMVcGvmi1DNWd3RzrV8jf0VejBzUzbVuj3xSapepdU/k027s33Z45KR+cE7LrtMpkQ/GrgAAWNDdkadKLUSyyJgkO0VvRV6L3N/NtYZbgff1E+G4yPuR8/qJOeRZsGP7wSXk97uyH5zTsuuU3327jhwAwEwfltoFyi287Az13o58Hjk+8k2Zfn4ti6GHN38+IvJIGR26z67Wrs1rnt0cm+TEyBvN63z/45HnI0+Wuh15cjO/jEcjN/eDc1jVOgEALOz1yCGlns/qHz2RhddXpXaOzon8Fjl/7IqRYyJvNq+fiTwROTXycRltkV7/zxVbDUrtZA1lYfVu8zq3JK9qXi8ju127y9Yt2+2sap0AABZydhl1rPKM1h9ldDdjFlx5HmvomlILlSzMJskC5eVu7KLIe6UWNEN53bS7LF8q43O3NT+nF8rkGx6yCMvC7tsFkn/Lc/nmOaxynQAAFjIoo07TUaVu++VYFli/l/FuWHa+shCZVmzlduErzetLSt0iHJR6rmsoC55pNy3kdunw++Tvyc9sZUG407st8/OzEDy9n5hhUFa3TgAAc8vC4tVuLLtIWWxkEdLLQ/TbFSK3lFqMXR05txnPYifvlMxO2DvNeC+vyY5cGjTjN5baxVp0G3OSPGuW27TzWsc6AQDMdFapRcUPkSu6ufRLmXxg/t5SC5Esui7r5oay45RbhHlmrbcr8lHkrm68dUHkp1Kvy+93U+SxUgujW5vrdmLQD0zxdVnfOgEAzJSdrywo2nNl88gC5IHIGf1EJx/fkY+9yMdnHFnqnZ754Ny8w/PO5rpZsqv1famP8hjeaboK2aHLfxk1jy/LetcJAGCmPIe1TlkYPRj5LPJjqVudR49dMdtGGT/39l/Iv2Hd6wQAsNfKzlZuhwIA8D+V58YmPb4DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANgn/A04tKqq3niFZAAAAABJRU5ErkJggg==>

[image38]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAZCAYAAADXPsWXAAAAwUlEQVR4XmNgGAXYgBoQzwTiWUh4IYoKBgYWIK6DysGwJ4oKKFgDxP+B+AAQ86BKgYEZEFuhC6KDCAaIIV+B2BhNTh6IL6KJYQWKQPyEAWJQA5I4PxDvBuIyJDGcgBGI5zNADDkBFWNlQIQBiE0UEAfi6wwQg4KBeCsDxCUkAZBrpjBADDnPAAkLsoAbEP8DYnN0CVJANAPEJdzoEsQCQSA+zQAxhGwASh+gdPIcXYJYAIrCYgaIK46hyY2CUTA4AABbgSIUVzvAdwAAAABJRU5ErkJggg==>

[image39]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAaCAYAAABVX2cEAAAA/klEQVR4Xu2Tvw7BUBSHjwQhBiOJwWgySSQGm4HFwmCXeACDxdJXIBEiMVsMRgmL8A7EK4hVYvDnd3JPuVpEdZL0S7709v7ak9tzb4k83JKHEzjU7MGU5GlLNoINyWwkYBW24RmuYAVGtPwCj3AAazAp2VvCcCby2MQHlzCuzX1FDF6hIfcFuL6nP8DFNrAMdzD7HDvjRKrgnlwWYrhnXIx32G/JHBGFHbil5945JkBq6/napUfveFMcwQUMUsWYHKne8fkqytxX8DlqwTmpz2TMM8erG8vcR3g1fVIv1EkVNeFxBh4kD2mZjRKph3SbkgXh9EW+oMcv5uHxv9wAy3018v889rsAAAAASUVORK5CYII=>

[image40]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAZCAYAAAA4/K6pAAAA40lEQVR4Xu2SvQ4BURCFR6FQCZ0oVBI9UYhSJ1HwAh5CFCov4AWEbO8JVAothWgkEo1So9JIhHMydt2drGQVuv2SL9k7s+fu3h+RhCgKcALncAfPEZ6Ctw0p6MGrbYAZfMIVzJteQBEeYMfU06LhIyyZXogWXIgGfPg8lhhhMoBdZ8wlDUW/XnPqsejBB7zBtunF4i46ASf6mbpouC+6DMK9aMDMe/wVhnmMXLsfJlW4hFmnFoI7zJ3mhk1Nj+xh0xZd1vIJu8dIeHE2MGfqAfwthrewInqdaRmO4EX0LiQk/IcX5cQn6lF6loEAAAAASUVORK5CYII=>

[image41]: <data:image/png;base64,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>

[image42]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAaCAYAAAC+aNwHAAAA/klEQVR4Xu2TsWoCQRRFn2BAUaKFvSSFtSCksou1hZXgP4jYJL2NdYKNjaS3sbDLF2jhTwgpU2khmHivMwtvHzP7BXvgsPDu7Myb2VmRnIQWXBrnsK7GfJm8rTJpwAk8w3+4gK/wQY0Zwx94gR/i3knRg3/wBDsmI0W4hm82SNiKW52zh+jCnQRWTjiKm6BvA88UrmDBBglsn3t8toGH7Y9sUcPVv2HFBp6DhM/mDldlBzzIGLGzucN9Z7VfggNb1PDTZLXPiZ9sUcMJeNNC8NRn/hmlCn/hi6qV4Tvcw6aqR+EWrnAj7q7zWn/CRz0oC7bIn2oo7nvX0nFOTpwbngwrAN/Q9qwAAAAASUVORK5CYII=>

[image43]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAaCAYAAACzdqxAAAABTUlEQVR4Xu2TvytFYRyHv0IpJBkMSNlkMFixsFJ0lfI/GCzKzKBkkMlmkMFisaDcUmaLMmIxsZnkx/Ppe97u+957rk53MJ2nnrrn/bzvue/5nPeYlfw3s3iMj/iCS2ncwI75PHmPh2lcYxQruI8/5n/yF+/m8+5wFefSuBHt5ByvsbsuCwzjjfmN1+qyXLSgipP4imNJ6szgNn7iLfamcT7zeIr9+IFTaWx9eGS+Ae32II2bs4Wb2W8tXIgysY4r2GGeL6dxPl14htPZtRZu1GKbMH/znTiEbzge5U0JNWg3Qjc+wbbsWrsN6KlaqkGo4yr2mHeqfoWe7MJarEHoVDzjCO5F46rhyQrWEI6ZFgUezHtUz7vRuCr7tgLHTC9DX88lDkbj+vK+cDEaG8Ar8/7bo/EG9DjalSYGw0tR3zqz+mMRzwnGp6akpKQIv4PRRHq+fjjcAAAAAElFTkSuQmCC>

[image44]: <data:image/png;base64,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>

[image45]: <data:image/png;base64,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>

[image46]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFcAAAAaCAYAAADCDsDeAAADIElEQVR4Xu2YTcgNURzGH6F8lXjlu1ySLHwsrAilFBYsRJSlwkIWLGyV3oUiJVESSb6ikJSvxZWNopRSFhQSK4qw8P08/jPuvKcz956ZuXfu+zK/enrfmXNmzjnP+Z//OXOBioqKchhE9VCTIpXNUFi746nBTtmAZxR1i7pMHXPKyqBGnaGeoDuT21Fk7hVqgVsQMSeS6hVlLCxCXWRqPfr7T5FmrpboDuoidYp6R+3rUyOckdRm6gO12ykT/52526gvievZ1BtYjs7Ce+oH9Z36hQFkrga6lHpIPYXlzCOwKFlHDWlUTcVn7hqYEYcS94SM2ercC0XR3zZzlV+0EzZjNFrXacYu6gE1D9kjKsZnbi/8RqyGmZSHtpk7lXoLW1bqUIxy2GNqGmzZqbGjCIswH7dhE1QEn7lpRmgsdeTb3NLeKYLNHQ7bBGTwa+oCbHMYA4uy59QE6gCssTrydVbvmOnezIFr7jDqOvxGdN3cVbA8eJj6Sa2M7itX6eU7o2uhhuK8psnIEoV6Vp1pphBcc7Wz34HfiK6bG/MCFqmKWHGS+kYtjivActum6H+ZLoNDUSdftZCisBWuuSLNiH5jrl6U3G2TKUGog+eoGX9rZCO5AorgMzdtQ1sL+5rKs3m23Vx1JuYjdQmNzUuDOYuw6PKxEJbfi+IzV6tJ/T+euCdkjM+cENpu7vbofx23dH0DDUPOU5Op/Wi8PCv3qfXIF0kxPnP1vr3U58S9GmzlJY+OekbjUspr1gfl8WuwugedMpHZXM36V+oqdZfaQH2iHqFxmqhRy2BR+PLPU9mYCDuO6YeXJU5ZKD5zhQyRaTo+bqGeUTf71LANWF9f2gDT8rAM9Sl5RM1srlCDeqAnutasK+e6P17sgUV1HnTMWwRbCZrM5ABGJOqlkWauUDRuhKWJWdG1i/aM07DJyEsuc0MYB/u5TQOY4pSVQTNzQ9BRU6mtCB0zdzksJeiDYLpTVgZFzT0BS2tF6Ji5QieGtJzVadSuNpsVyDe4IulAKFXOp+4hX/v9GpmjfB1/eJTNXFi7MtfdiyoqKioqusRvA0C7JqaP+u0AAAAASUVORK5CYII=>

[image47]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAAaCAYAAAAJ1SQgAAADBElEQVR4Xu2XS6hNYRTHlzzyDJFHDJCJvAYyEEPCgISBYmbAAAOFqTswMJOUkshAUl7lkVCUkjIlIwPySDIk8vz/fPtzvrv24+xz7t1X6vzqX/estc/de33rtY9Zjx7dMNIbGmAo7lHJMGmPDc2DXJUmemMdtkrnpVNO6zO/t6OVmS9li/TEGxvioHTXugh4sbUCfivtljZJUzN/9P2SXjpfZL70Qlrj7E0xRXpsIWgqqmOOS2ct/2U+x2C5xoP/mHRbGuN8TbJNei8t9I52LJA+Ssu8w4LtkwU/13no03fSPO9oGA75hPTM8pVWyWYLmZvsHWKXBd9DaYLzwU3pnjTOO8Rwyw+s8QW26Zm9U7ZL36RV3lEF5UlAvoSB0i4rYaCPT3ujheFxQ/pi4TDnSPel14mNsj+a2b5LZzJbXZZLny0kpBZki6wR0EXLT94PmY+HK4ISP+SNFnqqz8Jh0AKPrNUG3I+Bdknamdn4H9xnY/a5DrQOLVSWiByxhMvWRlUJA/4NzjZJ2mehNPEf6e/+E+hzC+Ub4YF/Squzz5T6XmnJ3yvyzLRwmLRSLWIJU64eyrqqhKEo2BT8cWdH6DMmfGwbZgWHTTnPzWxLLUzbqkzHYB84eyHxJjwQze5hylWVMFQFS2aLJjXfSftshfRVuiCNSOztiMFycG2JK4e+K1s7ZSsnQpb2e2MG3/OTmmAYKgyXyGELB0Cfk22CqEMM9px3FHHZwk2uSGOdj2l63cKE9KsihT2XlmQKvepLmDVBy6TX88AMK+5zwMIhM7D8QXno7x+Wv0c/YtkQaKrRFv4Bg8L7/ANGsBct9lHSNWmWs5M9lMLLwRvplnTSwuDidZAXlio4kKI2aQwGCAdXtNiLXhTIHi8bKRwi77uIv0kG2V6UXuQgMUzhTvt8QEyTnlrou8GC6U9Zs+7KVg8HwbRe5x1Ns0N6Za21MVBoC7bDWgu/ujxknx8fzJRO3rgGjRnSHW/sEsqctVg0I4Dy5ffzP4WAZ3tjA1RO3x49evy//AZ8SKa2AP/EkQAAAABJRU5ErkJggg==>

[image48]: <data:image/png;base64,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>

[image49]: <data:image/png;base64,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>

[image50]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAaCAYAAAA5WTUBAAAByklEQVR4Xu2VzytGQRSGj1DkR0TZKIWSFSUbxUIWNixkx19B1rKwkEgSxYqyYEVf9l9ZyYooS0kpZUFSUnhfZ8adO3cuN1nep540Z+43M2fOzBDJyfmZAXgAbxzZ3jTOwfbvr7NTBpfgPbyFLfHuOJ1wHC7DKzhp2nQKPsIPOG1/kJES2AffYBFWx3pTmIerfhAMw3f46ndkhAmExk3QCu9Ed8VnSP6+CGb/IOFxE9iJ/C2rhAXRbHg+0qiDDaIlcGFyx7DGiwdhKTiRz65ofFF0QT61opmewFPRM+UyKhlLUQGPJMrWegh3YEf0aYxu0ZvUbNrchYWo+wsmx4X8ii1F0YsTDsrF7cNyE+NkKybOLEtFFzILz8w3xJ4zv8RBbClC2zYi2ucerkZ4aeJ8A+y7wqtdZb4h3IFQiRO4pRjz+siEJBfBv2wzS2abRto5S2C3LO0asQwciDfEHky7CB7EehPzYQmKot+xVIOxXo8t0UnWnRhr3AY3RLe61+mz8PV8gf2mzXPCic5N2y50G+7BHhOP0QWfRBeQ5oXEa+zCQ8pDyzE40bXortmbwv8ba/AZzkjy/fhXuO1NEt0cF04cesBycnJyMvEJd4xqiccAMEcAAAAASUVORK5CYII=>

[image51]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAZCAYAAAAxFw7TAAABLklEQVR4Xu2TvUoDURBGR1QImEJLMVjYSGqxE0tRBF9AsPUJRPIAvoCIhQiSIp2FjVYWFmLjC1guglhppXb+nI+5K9dxEwQFmz1wWHJndjJ3MjGr+WvauI8HeJs8SZ/lLi7hKN6k+BMe6uVBrGCBU+F8CPfwHcfxAp9xLsupZAdPsREDsG1ecBEf8BonvmQExvDc/MXICB6bF9xIzyPzzvsyg/e4EAPmIyjMC2meeq7nCVXoukpUNzkdfMUrbNkPr9s0H7QKlr+yfMRLXMXhlFt2ORCtjb75LQYCmpkKrsVARPNQYhHOI7qm5qx590VJmokKboZYRHHNWmhnp7PYJ1pOLekLzodYjq7bMy+kJs7MR/WNLfPu7nA2xHLKXVQDy9hNZ79m0qr/STU1/84Hz+A9ZjJ61hsAAAAASUVORK5CYII=>

[image52]: <data:image/png;base64,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>

[image53]: <data:image/png;base64,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>

[image54]: <data:image/png;base64,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>

[image55]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAAZCAYAAABJhMI3AAAC10lEQVR4Xu2XT8hNQRjGH/mTohCRQkjJvyyQKJSwI6IsyMaOhWQh2ShZSMnCQiGxsZFSbKxuLCgLpaTIgkJISpGUP8/TO9M3d+53z505597oM7966tx3zpkz85x33pkLFAqF/4BR1FonXRdqsIT66KTrf4mx1BxqctyQyXFqYhwko6mZ1HQ0TKDz1G+nc1FbCjtgWawB9QtNaDf1iWpRz6l71NyhW5KZRL2CmRWygXpBPXZ6Sq1quyORMTDjVlJfYUbW/SJTqdPUWXQOOJeH1CNqShDbRP2iTgSxXmymPqDTxOvUO2p+EFsE+2hqy2IFtQBm5iWYiUvb7shnP/WWukktjtpSkVk3YOPy+EnK3BRmUfepg+g00fcTfqRpsGyUucl443zmybzPsOVdNxs9qmXbYYOqs9T1Ma9GMZkgM75E8eHQ+y9QR2CJEpuo/ltor5O6VkxtyahzTdIj42SgjGyajR71+QD2HpmqyaVQZaKytBc7qdswYwZm4hrqGTUvimvS6kT1US/vF6qXZ6j3SDOyysRek1T/e4PfAzFRy1jF82jc4NBRRx1pqYc1qS7XYDVStXJC1NaNJiZqVw8/1EBMVBZqS58dNzi0WzfNRtVA1UIt5Zxl7KlrojbJVhQbiIlVWSj84dtnYy5+Q7lLrY7aUqkyUR+3G5rXD+p1IB1x1J9WwxNqmfvdQgMTq7JQqC6exFA2pqKleoi6jM5am4vefYcaH8SWw3bmcDOMkREyO9Q+6g3s+RmwVeH70bHGo7aXsONPJetgA8yRln8Vh5FX71LQ0eQnrL4JTfwK2v+aelM1xnEuFqOysgdm4sIgvg3W/zFY0ki6VkwH9K74DSU2qZf0TD82mBxkmv79fKNOUbdgy3JjcI+yTmP7HsRCVA7iufg6L9MOwPq/6KRrZa3aRhQqO7uo9cjfnFLQ0WsrtQX9XUmFv8FwxbxKI265FAqFQqFQiz910cn6gmSi+AAAAABJRU5ErkJggg==>

[image56]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFMAAAAaCAYAAADL5WCkAAADIklEQVR4Xu2YTcgOURTHj6R8fys2vCx8FFkIsVBEsSChKJIsZCF2JEqRhZSF2AhPlI2wkULSGzbYSdlQCGUhJRTl4//v3PM+t/POjDuP4e2t+6t/88y9M3fmnnvOPWcekUwmk8l0ygboEnTGaVXoHw4dcn0rQl9fMBiaLfpeqazxDRWMhhZDg3xHCnOkbdB30E5oLTQ+9A+BdkBfg3it9RUxANoKLQy/m2IgtBv6AF0Ix2OSNulf0GfodYFOhGvGQpehl9A50fHNoWpzUtSg3gDDoPNQCxrp+sqYAV2DnogaoQm4yFzMZeF8puji7++5ohh6Mo1ZpB/QelGHuQ49hibobbIN+iTqFLWYJboS81z7Q2i+a6vLJOg09B7a4/pSYZhy8lzwmH2hvYpp0AjXxvFuQ6PCOR3lJ7S85wrdRrpF7UL7JLNO9KUsfBk6e6GJPVf8PeOg46Khyd91OCr6fjRezOrQXkWXbwAPoAXROT3yi/R2Jm4nHJ/PSYYrzpsY4tw7roqu3L/goOhq01vptSnYpMqMWScZ0VG4ZcS8kmpj+ueWwhC4L3oT3flZ+P0xvqhhuA8z5Bn6VcnMuCHFk+rEmFukHd4GF7cRY1qIU5wk2RXOp9pFDbJdNHG0JH38O1I8qbrG3AR9842iiaYRY1qIX4zaOMk3og9vCvPGOuFtlE2qjjGZsW+KzsvTSJiPEd18ecPmqJ175ynRbJbyolWwnOI+yUnw2AllCciiypdzRVjF8sJ3SHEC4pgsFTk+n/NH7AF087mub5FoubDStdeBWZtGpEfaFtIJXGhO6qxrTymNDDN8t2snV0T74iLdSiNv5FKYtTkIC+yhro9Zj30cbKmkF9+87oDoFpHydZICveSI6LtYEd0l6mWtcE4s7ItKGS5EmTG56I+ge9JOThuh7+FYCb2OGzEHj8WvBWIeG/fx02ty6O8L6Nk03FvRz9vn0C3RUs6YAj2FpkdthuUGJrMirJK5KxoJ/NpirZ3qRP0OeigNxcnymLJXGizBGC1VyY+RtER0/LofFpn+wGHp/e9MmXziy2QymUwmk/mP/AZx0srzAs/WuwAAAABJRU5ErkJggg==>

[image57]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAbCAYAAACnZAX6AAAA2klEQVR4Xu3SvwqBURjH8UcoShmITAqbUS5BWUwGkzuwyl3IQGajxTX4MyALxWK0GCSTSeF7nIPjxQUov/rUe57nPed9Or0i//xqXAgh4mx8ih9V7DHFDGXRh3zNEEukzFq9fELRrDPwmedbgtghbRfJFhPR/YqjJzU05X2UkeiNWfTsRhgr5O2iSR9HtFC3G2pW1QjYRZM+zig56pIQPcKnTWPRB6qDX+JBW563puJGDgNcUEDS6t+ibueADrrYoIE41phj8XjbihovJvpPUF+6x4uo6f/zQ7kCetAh+9Rm7nsAAAAASUVORK5CYII=>

[image58]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAZCAYAAADqrKTxAAAA+klEQVR4Xu2SMWoCURRFfwiBBGxCIFZCsBMsAmKZTjeghYgLyBICqWzsRGysLQTBznSW2YFNIIW4AgtRSNAm5Lz5jPy5IwRLIQdOMfcNf95cvnNnzT3e4YUOjnGJTZzgHBf4mHhDaOAAr4LsBb+C5wRZnGJO8g5uJTvwjG3JMviOM8kjrnGMJclt3R1WJY+oYNf5k3u4xD6usB68l+AVW5JZ1UP8dP5/U9iwoKHzzX1jWQfGG95q6HxzP86vn8JOVIq4dr65G5lFzdmJihWxxycdGHn8wIcgs6u0wVqQJYi/YlfHWjLDa5TCVhtp+Be2mjV3EvFN+OdUfgF/hCIa/qU8bAAAAABJRU5ErkJggg==>

[image59]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAABTCAYAAAAiJlt0AAAE7UlEQVR4Xu3dXahmUxgH8KWhCKMQaUwhKXLnK8OlRJpCc6GmjDsluaDMjYuJUuOSotwIRT5KonxNmmYuCJeUlEKDjAsp5CPD87TfPWefNee8Z69j3vOeMb9f/TvnXXufc2bu/q299lqlAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAUXRP5KXIP5G9iy8BADALWyPP1oMjKGwAAGtEYQMAmKFLIh9FdkSuiPweuX1y7dL+phUobAAAM/RjZM/gc5a3A5ETIy8OxqdR2AAAZmRX6UpZlrPeztIVqfya12snRLZEtg2yO7KvGsucOvmZ5ShsAABTnB35LLK9Gs/HoVmk3o9srq4lhQ0AYI3kerVfI+dW4/l4M4vUSdX4NB6JAgDMwKbIV6WbaRt6pHRFqoXCBgAwIzmL9mfk9ci3kbdK98jzwcgHkTcXbp2qtbBlUauzd3gDAMBqLLV2K3NrZMPgvmPNaZHzIidX4+eU8f+v1sIGADBTr5YjHxnmAv0cG75tCQDAnOSblXVh69+sHLvRLAAAM5TFbH81lnuZ5Xj9xiUAAGss17FlMXu8Gv8p8nc1BgDAHOTeZYcir0WejnwYORjZOLypwZeRb0bk4f4HAACY7u7SbXdxcenerMy1az8vuqNNvomZv2el1G9w9vIRrHQBADh8lFOWtKE8LSBn3uYhX3KQLgAA5arIb+XIcpBr2lZb2P7rDBsAAANL7b+Wh5vnWJaq9GjkuchtkS/6mwAAmK08vinXSH1XFspZng6QcuarH8s3SF+IfB+5PLJ5cg8AAHN2RmR75KbInaU77eDlcvwd1XRZ5JfID6WbeQQAWHeypOR2Hznr9kTkjsWX/9fujbxTulnGXJeXhTVnJmfhutLNan5auoIMANAky9qxvMVEzhK2yke/F1Rjf0SurcaW82Q9MMXnkasn3+fWKvmYetfhqwAAx4Gt9cAIu6rPOcuW6/guqsaX0/LoOGfW8lSJXp44kVut5JYrAADHhLNKdwLDY6UrTq1aC9v1kVdK93dvjJwfeX7ydayWwrY78tDg887SVg4BAOYqZ5tyn7jcE+6ByFOlW0d2ZunWfY3RWtjy5IcsTXmOas5+ZfK4rRYthW0oX+7IrVbejpxSXQMAWFeyuGQ5y4X/Q3+VrtBkIRq7Nq21sL0R2VSNZXGsNxeeZrWFLf92FsXVzCQCAKypXNyfi/wvrMbzyKxc35UzULn1SG1LZFuVfORYj91Slt+mIzcJzsI4lDNuN1djvfxd9e/ft8RY/tumFbG8loX0rmocAGBd2lOOPIEhfV268ZbtNVpm2LKo5Rq2odMj+8vsZ9gODL6/r9ikGABY556JHKoHSzfDlqWtRUthy7J2QzWWjymHb3GO0VLYrox8Uhafs/puWTh5AgBgXbqmdOVsw+TzxtJt3PvxZDwPrd8xubaSlsJ2f+S9svC4NR+bHizj91/rtRS2PJ+1f7mhT8vPAwDMVW7Y2x9C38uNfDNjtRS2nNlKObuVpxv0hbGVwgUA0GDs26Qp9187GlpOOgAAYKSlXjgAAGAdyfVqeboBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADB3/wLzRd0IWgyiQgAAAABJRU5ErkJggg==>

[image60]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAABACAYAAACnZCtBAAAE7ElEQVR4Xu3dS6i1UxgH8CUUuV8iJJGUMEEJMSLkkjAgiokoSggx+koGykAykvoykEQZuOSWjstADKSUEoVcoqSE3Fn/b+2X96yzd+d8zrfPd9r9fvV03r3We/blnMnT86y1dikAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALAT7FnjgRpn9hMjf9W4sh8EAGDjJGl7osZu/US1X40farzdT1R71HimHwQAGOzdD3RWm2e572pc3Y0lWdta4+gaX5SVf9NzanzSjQEAC+ywGl/W+LvGVzV+Lq3yc1SN40f3nVrjo9HjWY4ta7tvHnatcWGNPyfxY413auxS4/bRfZtJkrXvu7FHaxw5uU7S9mJp/5PB8zXuGT0GABbY/aUlNteVVtWJfWu8VFoF54DJWLxa497R40ESvjO6sWtKS/g22oelJZ4nlZa8JVE7r8ZTk/GNkte9YkbkfY29XOO3buzW0XWeK2vZzh+NfVZalQ0AWGBJpj6ocWdpCUEv1ZtxgnNojYfL9Ht/qrHUD5ZWNTqxH5yTVM/yfmcliWkrLvWDO1kqke9PrpOMnT667j1YWmI9SIUt69jyHADAgnq2tARn935i4rLS1lYNLimzKzp5nof6wdJ+f0s/OCdJZn7tB0feLNPf4870cWkJcxxc477J9eNlZVUuCfQfpf2/kqjl3iTPJ0x+BwBYMKmWJcnK7sRZTqtx9uQ6bdF3a+z13/Q2eY5xPLZ8etvjr7uxebi5tGRtqFBNk6MxDuwH1ymt47SUU6l8o8YFy6dX1bdGk7TNSqB7+5eWuAEACyrJSxKsVM3W4pgyPfHK2rUkKa+U1orsdzLeVdoGhlmSoFxaVlaTpsUsWXeXYy+WysrXn7fPS0vUBu+V9pkAANYlVZmsf0qLcJ9ubpZTSlun1svZYU+X2a3Si8v8F/rntbMgPy3c1STBfKTGVf3EFFkTl80A05LAfO5UJ4cWZp73+tI2NwAArFsSkKVJTEtGBjeNrtNqnLY+LK3V7CQ9op+Y2IiEbXiN/JzlkBon13irtDbk3WX11mOS2qzBGx9rMhgqjt+WVmXL7tlblt0BALBOaYnm+IskXL0sZM9C+PHJ+7MqbGl5jhOyc0fX0c/3hupYvxZuWswytESzjm2atGqTqKWiOJxbljV5t/17x/Yb/h5rrVACAGy3VJySBOWstN7lpVWXxtLyy7lf4yQu0g79fXKdQ13PGs1FWob5aqV5u7G0w3EP6idK+yz5THn/SSAjlcV+g8T2GL59oE/Yckbd4d0YAMD/dlxpSU7OSnuyxms1vinLT9Mf21JWtgezbuyX0hbbZ7dk79PSzm7bCHeUdvhsdrNmnVpalVmDNtiRCVtkx2yS0fztcjzH68unAQB2jLQ/s0vz2tKSsf6YibGsY7uhHyxtE8OstXBJoKYdAjsveS9p9+arnoZvbRhkrd04YdsRZ7LleVJ9dLwGALBppBrXr1ObJQe6rvXYkI2QtukLk+t8+4IDZwGAhZTNCEv94BTZgbl18nOzSMXtudIOBE6rdNpXbAEALIQkYRf1g520G/tvRQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgM3pHz/5vLETKvpIAAAAAElFTkSuQmCC>

[image61]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAABTElEQVR4Xu2TMUsDQRBGR0wQIRA0IUE0hWCnYBEIpLJRCIi9YHotrNLYCvYhhX/AykJbU6SMpY2dhU2KVNoJFjbR72N25Rx2OZUr78GDu5m7nd3ZXZGcjFiG+7BqE1lyCj/hJZwzucx4hC+ihQYmF4Pf9mwwRh3uwAvRH19/poNwtTO4axMxTmARbooWYKG0li3BCVw18SA1+OCeOTBbxSIb31+E2Ya3sGATlgocw71EjIW4+VO4noiTedFJrcAbeOCeOU505YdwCBdNfEt0Necm7mGruPrUVpVFV9GxCdFZscgzbJgcacJ3+UWrYqvwcBAWOrMJcCSaS2UESzaYoA0/RAfjRfX4Vk3cO8dg0QX/gYezPxbdNBoqxlZcixZ5Er1LhKfqDd659y7sS2DjuQ/8+S/yLhFf5Aq24D1cc7lM4ax5bHmkc3Jy/sEXlSg+OEpvBVcAAAAASUVORK5CYII=>

[image62]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAaCAYAAACD+r1hAAAAxUlEQVR4Xu2RzQpBQRiGP0VRFmJhY4Fs7JRSVjZchVtwG+7Ayg24BQtp9uyVsrFxBRbIzzMNp+nrzGyVPPUs5n3PNDPfEfktKrjFKy5UFySHc3xiVnVBunjGpi5ijNFgUeVBGnjBvi5CZMS9Y6qLGA/cYVUXaZTxJu4UO+LoxGq4wYG4d5wkMrEW7nGFBVyKO2Xif/Shg0dci7uSxY7XbjDvdcIQD9hWuZ3WTNymBPtzDPb80GOEd6z7YclfpGD7vA7/fI8XXVkeg7zZxLIAAAAASUVORK5CYII=>

[image63]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAaCAYAAADSbo4CAAABoklEQVR4Xu2VMShFURjHP0URBiUpg8hCyqBMyiYWk4EMbBalEGUzGCgpI0mUMtikjLeMFgMlExIZpGTG/993zut7p/du73Zd0/3Vb3jnO7dzzvuf716RnJxkjMJ9eA2f4B08hLvONdhVmJ0h7XAcHsNHOON+ezn2AzdgjT6SLTvOkHp4IrqZxaD253TCV9gdFhyN8FJ0M5kyJrpIU1hwNMBI/mEj6xK/SDO8lfg5qanktIzsXeLnpMbHchUWHFXwQHTOhRvjPxTBL7jgxiwt8Eb0mZegVhYfS6mOIR3wWXTORFDbFH3nWLjxadEoT2F1cbk0Npap4lKBFdH6Gawz47zY2/Ac1prxATgHH+CsGY/Fty3zL9e6H/Be9MVn6YPLopHabluCw6LPDZrxWPZET2v/Xp6OixzBb9hqapZV0YO8wX43xk8B376MpKJYuNCn6CZKyUvIC9rjHwjwsTBanpzfK25gHrZJwljSwBh9t/BbxEVH4JBoHIliScOkaNuTSDRiboxR8HKzY9jimcL23IK97jfvgr3M7KKK7kdOTk5SfgHuK1vYXhLXEAAAAABJRU5ErkJggg==>

[image64]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAaCAYAAACD+r1hAAAAnElEQVR4XmNgGAVDFnAAsSQa5oFidDEw8AXi/2i4HIrRxcAAZsN7qMRPIHYEYg0gvgPEt4BYnwHJBhgIBuK/DBBNIEV7GCCGmCErQgesQDyLAaJpMZSPFzACcRkDwt0gNkgMJwA56zcQb2OAaAA5ESSGFbgwQNwMchLIKbBAwPCHJhCHQCWeAbE7VLyTAeG0u0DsCcScULlRMMAAABO7KKyFjrTTAAAAAElFTkSuQmCC>

[image65]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAaCAYAAACD+r1hAAAA0ElEQVR4Xu2RvQ4BQRRGr0JICAohQrWdSqETpSdQaDyAR5DovYFerbedsNGqlTqJXtCIn+/unZ3czGbVij3JKebMT2ZniVL+kSwsuzEJXriHJ1hXvW1ajA68wg0sqD6FHzW2LOEbDlRrwTM8qGY5wgv0VOPNfAgfFuMJfZhXbU5ynbFqFp6YqXERBvAOuySbctFkk2TDAmZM25kWwBIcmh7Cd30Z13AFeyQH3OCW5B9Z+OkmJPdvwJqaqzjjcBF/bF/HX0RvXXUnkhjBhxtTFF9yNiRQU2KS/gAAAABJRU5ErkJggg==>

[image66]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAZCAYAAADXPsWXAAAA80lEQVR4XmNgGAU0BbFA/IgEvBuIhcE6kQAjEP9Hwu9RpeGgAoj/AvFXIDZGkwODWQyoBsmjSoMByLIJDBB5TzQ5MOAH4j0MCENAbJAYOgC5AOSSaHQJGADZfosBYRDIdawoKhgYBIH4NBBXoYljgGAGVK+VMUC8QhJAD+gaIGZBUUEkuM4AiYkcBlRXgAxzAGJzJDGsQIUBEnje6BJAIALEVxkIhIkBAyRBmaJLQIENEP8G4nR0CRBIYIA4/xAQS6BKgQEzEG9kgIQR1sQGUgALxHcMmMn8F5I8CD8HYiWwTiQQz4CqiBC+C8TiYJ2jYCQAAPs/TXzzN9AiAAAAAElFTkSuQmCC>

[image67]: <data:image/png;base64,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>

[image68]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHwAAAAaCAYAAAB1szj5AAAFE0lEQVR4Xu2aW6htUxjH/3LJ/Z67hAfk5JKQIpJcXiiHIh62PBCn6ByXkDqKB8SDHHJLR0kub1JuaYdccnIpUqI2ccqDREjk8v365jhr7s+cc8015rTX3qv5q39n7zHmnmuM8Y3vMsY60sDAwMDA8mAb0z2m1aarTH+Yrl/0xApka9NesbEF25p2i40zxlGmBbmxMf4zxe8Hjh5ZWWC0DaYbY0cLMPbTpjWmrULfrHCE6XvTfcXvN5t+NZ2w5YkJYQc9ZHrP9E2h102PlnSladf0Bz2CsR82PVH8nAOR4V3TutgxQ+woj4Js6idN35oOXfREBuepPlQcbfradFrs6MinpvWxMYMU6naOHTPGa6Zb5MbvzF2mF+SLVwVh82XTDrGjAz+aVsXGTM4t1IaDTAfHxmUOEXBOPaWuneRhnPxQBznjB3kK6AO88SXT9rEjk73lXl63Ycsca3rbdKZ68pb/GYxcrlOulc8hm/NN/8gXrY5TTX+bzoodmVwmTyNl9penDsaSNC/fHGy42B75Uz7OSeAzKRrZzDknhQQF5EfysX0n30yRC033x8YxYNiftXjuOCdOmg3hnBc1eQfHgk7VYYDPjO/C2/YxHW56Qz4mnqOdCf5lulxupCrj8DyLmgNFKdUwBWROQTQnH+dN8nFQn0Q+NB0SG5cavGdePsg6UnX4mZqjwCRsNB0WG0uwMIwJI18sX0jUlMOIQE1paRzkyUvkxeurav6sOtiwGDuuJ5Fx6sYGcjLhDO+tg8p9wfSgfBEw+rx8Umu3PDUiTXqz6fbQl8DgeGoTFHV8BoZE445uzKGLwRN4KiF5U/HvpHmefMu4U4F7kun9Ufd0eVw+ODy4CnLTm/Jnyjt+D9Pz+m/hxeSY8EKprYo2Buddyeho3K3ab+pucIx7gTyanaw8L2c9WJcH5GGcefQFdyK/yJ10YjDaB/LFpIiKMNmUk7iAKUMxweLy97wHSA83mM6WG6oJDD6u0vzC9LnpFY3G0OTldRGnLSwmUekp+Q1XF6h5WIM+jZ1gjm/FxjZQNBEGqQKrFv8OeSjF+2NVeKm8QOLWh3MtkP/SRsBDmuCZpop6P7nByXt4NpUpBm3K4/THyr8NFIB3m+4tfu6DU1R/kdUFCmvuS4geE8P9NYv0sUYTZTEPkO/Qn+SGrcpht8oNRmWbqu0r5B7IgFATGCZGlT3l4ZSN847pNo3yIFGDsVLE0X5R0V5m0nsCqnE2M159XejrApuUUN7nMTaxr+kr5Z9GsmBRCSvp3MzmSLdcbAJCWZP3Aju1z6qfMVE7tOFq+a1hXaTIhUhE7p6TvxuDk5IwUoJ2xknEAjbdl6YzVH12T2mVa1V+pnAup9ElAa/nsiYd6R7TKHemcN7GkL+r/XXoOFhEFm+aYOzyjRjrQFQiYiX4XoKomNrSGt4pP91EVskjF+vdKZznwmT4qo6BpAGkXJuqU9qaLnESz5leVPf7eRbqk9i4xODdfGNXjhrr5QbnlEP/ifK6qFz3pGttKu8qcKD0fArnMRWuKKhi2TC51exqeYhjw00LNuxxsbGAtMddBCcMClHSHxX2LkX/MXIjbjRtV7SdrtGxC4MnB+IdzPVI9fMt49Qg/26IjS3gpo57BBZypYCn8582HjE9a7pGHt43mY4vnqHQI90Bnk0EwPDkcp5jrary/cAyZnctDv/k8jLlQo9TUqqJSJvx2YEZ4JzYMDC74PlVdx8DA+P5F/8H+FvSGfpaAAAAAElFTkSuQmCC>

[image69]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAaCAYAAAC+aNwHAAABAklEQVR4XmNgGAWjABUIAzEjEl8AiMWAmBlJDCcwA+K7QHwFiOWB2B6InwDxOyD+CMSeCKWYgB+ItwCxLxD/B+IzQLwMKgdy1TkgvgrlYwUg00F4DRD/A2IPJDklIH4OxKeRxHACkC0PgFgaScyPAeKq+UA8B0kcK/gNxFuBmANJbBIDxIA0IE5HEscKQArLkfg8QHwAiD8BcQAQWyLJYQBxBogXRJDEghgghoJcAcLIUYwBjBkg/kRWBHN+HAMRgQhKLKxoYiBNb4HYmwGSRkgGIL8fAOJkBoj3OIFYD1kBIQByfisDxCugNBIOxC4oKvAAUFSCUiAoL4AAKEZGAa0AAGSiLKogyLrnAAAAAElFTkSuQmCC>

[image70]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAbCAYAAACX6BTbAAABZElEQVR4Xu2UPS9EQRSGX0FCsslGFBoNsYVqC9H5AyJEoaOwUUlEI9QU/oBG4itRiKCgIAqFrTQq1W5BhEYvUah4X2cuY1juRyGSfZInufecuWfuPTNzgTp/zSDdplV6T4/omucSbXgfnZBeOkZ36AuddPdyip7TA5p341OxAise0gyLr9KmIBeLHC3j++JC8RvaESbiMAIrcBkmSBcsNxcm4rIMK7ARxNUSLapaouvE+C2ZpQU66q6vaQUZdks3faDPsB2jNz2GTXZG2z+GJsfvd5sXn3DxfS+WmFr97qNP9C6IxyZqySMtBrloUm3BVNRqSQs9cbmyi+kkd9Jpukm38MupXYcV0PFWwYiweCvdoyV6SvvpLb5+7RsKqhV62HfXGzMA67nUeszDvlT3er4HGbao0DYchi1uI6wtF7AXWUDG4j56+yvYhDN08VM2I0P0kI7DFvTHxUyD/i+p/ox1/imvGzdQjoV2N30AAAAASUVORK5CYII=>

[image71]: <data:image/png;base64,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>

[image72]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAABACAYAAACnZCtBAAADb0lEQVR4Xu3dTaitUxgH8CWUr3zklkSRTERJkrqUiQEDkihlYoTEAMVIMdBloMSA5CMTKcqEktEeSMTEQJnQzUcp34oBwvNv7be7zu7cc9M9e79n8PvVv9P77Hd/tEdPz1prn9YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACA0auVzytfVT6svLDMrZWTh/sAAJjJLZUnK79X7lteJ78uc8yhWwEAmMNxlTcrj6/Uz618U3l4pQ4AwIadVfmicuNK/erKX5UHVuoAALP5pPXG5bzKNa1Pl36qXD/etGbHV56r/Fl5sPJ05dvK35XXh/t2UyZo/1ZOWKn/XPl+pQYAMJvTKpdUbmi9cXttWT+z8lll3/J6J9nrtb8d2gO2Uw63mf+2yrOVResNU6Zeed07Wm+q1iHLoXnts1tfBr298kblmcqpw30AALPKFG3ay3XdUL+g8nHljKG2Tg9VTm99KfLdoZ79ZWmqHmn9BGcmcUeSCd17q8Vt/FM5OFyf3/qk8bKhBgCwJ2SKlmnaOUMtE65XKk8NtU1IczZu9l9U/mh9gnds5fm2c9OW5c13Kj+uPrCNvFfunZzS+vs5bAAA7DnTXq7J1Ljc1LZOoA7npMrbrb/GkXLx8jnbScN4cPl3kud8N1xn6rcbhwEyQcw0LwcMJtNhg5uHGgDAnpDl0DQqk4sqv1S+bH3T/2OtT7fWLQ1TPkuWaCdp2H4Yrhet/+Dt0coEMcufOSk6uav198t+vriqcm/lpcrL000AAHPID8dm+XOSTfdpXDLNShOzKWnELh+u0zh+VPl6qC3a0TVs2bO3OvXLwYvIQYsPWm8a76zc3/p3c2nlwuU9AACzyB62cV9YGrXsAcsE6oqhvm5Zih3l1OaLrX+OyaL1hnJd8j3kNGuWg3NyNA1cmrocigAA2DPSoOR05rQ8ee3Whzcip1PTOGav2d2VE5f1HI7YaR/cbvq09alblkUf3foQAMC88nMXadLerxxo8/xPzSxD/tb6qc8sWT5RubJyT9vc53mr9Slf9rBNy6YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwP/yH/ySiY82/p5PAAAAAElFTkSuQmCC>

[image73]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAaCAYAAADMp76xAAACxElEQVR4Xu2W26tNQRzHf0KRe+SSBxJKSLlGlAeKQuLRH8CDUhSlU3bJg1clJcKDSB6UlKQoDwq5FJFSh5QilCIvLt/PmTWd2b81Y++tzinan/q0Wr9Za9ZcfjOzzLr8mwyt7IRxPjBYDJfH5RBf0ILzcrd1+B4fWyr3y5MZic+1cqW8f0Ke9gUZHso38pO8KSfKu3Kfletvokd+k78qf8i3FiqMsejF6h3PdvlKzvYFGbZaGFXqO1LF1ljoxPL4UIl58ppcaCH3Dljo9ajkGSq7Z/2N9kyWT2XDxUswimcs1LWlig2TF+Tt6j7LTvk+ueely3JvEouMkXfkT19g4SN0eoSLl1giv1p9YCbJZxba0RYT5H250ReIBfKzvOELLHz8oA9mGF/JQKXpEGHkSZXpLl5klnxnIU1SRsqz8qWc0VzUBx/PdTJCfj+Xj+ULecvCTK1LH6ogJVf7YAkqoCKmP0Jek7+M/MwknsIIM8052D2+y03JPR1kYBggz2a5zQdzkH/kIQ0+ZGGnoOJcznpey2k+KObLD1afMeotpRAdZ5RbQqUfZW91z/ZCzlL5n04iZqDU4IaF99PFyIIqpQO03eAdFipnuwEWwOEq1mqKcg1m9bML+G2QBdVbXXMsszYaHLczer4hiced4bqFhZdCnsd/hi9yUVIGoy1sdz6lWFB8i2+ukiuai/tyOLetNkGPGImGi8NKC2WcYovlHAuHRHqiUc4MeXZZf4Pp3B4LC5BGkd9XrJ5ubHU+52uwC5S2LFKDBkVZjGObngjH+DEXA3aEo/KcfGThGTrN1vbA6qkWZ8XPZg3Odt+IlLUWRpBr7jTjSOWE4qTKQX7TmMgUdx+JC3/AWW9hqtP8/xv4xWS2Bhym/pK8am1MZwF+oJ5Y+MUcNNi7WQudwtHNSZpbQwMOeZge7e1wSk71wS5d/jd+A00xkD1EPLMsAAAAAElFTkSuQmCC>

[image74]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAaCAYAAABhJqYYAAAA3ElEQVR4Xu3RsQpBURzH8SNMFEVJBmWzMTAZLQaLLJ7AI4hdGeUFTLIoi9nCIBaDDKS8gE0GBr7n3us697iDwSS/+gzn9z/d0z1HiN9KGmtcUddmb4miihsK2sw1QRwQ0wduKaGll2rk1yLwoI2ic/zKHFtsMMECKccOK3k04YUffdwRUDfJ47rWQE3DpRMJHHFSOh9GWmckhwtWSievSl7ZTOmMlIV53EDp5CPIx+ihhvhzEBLmX4+tdQVnYZ4mT+1YvZ0M9phiiCx2WCKp7LMjryusrT965n++mwf7qiSKcZnKsAAAAABJRU5ErkJggg==>

[image75]: <data:image/png;base64,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>

[image76]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAZCAYAAABtnU33AAADBUlEQVR4Xu2XS8hNURTHl1CEkFdigKREHilKMpDEgCRJUZJEUopiektmwsBAUjKQiQHJzOCWiQyUYkZRHkmYUB55rF/rrO/ss8/+zjn33u9+E/dX/849a+9z9t5rrb32uSIDBjRlmmpCbBwFxqumxsZeYSGTY2PEXenDwA1gzJuqMXFDp/CCjarHqr+ZDhd65OxSLYiNfWKJ6onqs+qBapJqhuqU9LBo0uSbal12P11swT6AwwCXVI8C22jAuMxnR2C7pWpLfSYmwVtnJfcYL/mo2jTUw1iu+qI6Htn7zUzVe9WiwLZV9TO7dsRi1bvs6owVi3rMGdUn1dK4oc+skXK24YTnYpEeF9hraYmlS91+IOpt1UPVlGJTCZxFFe8Fnvd3HFGdC9qA+VK8XqnmFZuGh3T4I/ZQHRtUv8SinGKi6p7qdvZ7peql6mTYqQYcdV71Pbi/LhaQMJ2d7WJtFNFa8NBlsQeYZB3+8n1xQ4Y7ZE92f0Ws/6GhHtUwn9Niz1BPnC1iQUmd+ZvF2oYLQgHfAwxAytThC+aawtspLsfE9ttssXrQhGVihTKuEWQI703B3uZ0abRgjwgP8GAde6V6wV786INeqFYVelTTEnvuvuTRpBiRfUQxRUcLbosNwEJSkGLsQz+aPIKpPUnfC6r5gY39+1o1N7BV0RZbGGnqeFBY9HrJvxOcqjmV+KF6qzoodr7GsL+ZwNHs3r0ZV0vAMQy8LbBRzcNorchsF6V4vDj0DbMNJ7KXeS8R5PgJnQHUk3jcJHyPeuq5vop5kiKDAxj8hljFhTliUaNPfO6x4JbkZzeTZS+v9Q7KNcnHSmUVjsXB/jV1Qqxa+za6I+Vvd5wf7/kSs1Q7Y6PY5HarDohVxhRM9LeUPQ0sFqeQwlVnMFGp2nOc9+E28PfGsEgW29evPqruM7F07wYiT0qnHNYpLPSNamHcMNLsV32IjQ3h6EmlZjc8FfsP0HdIsavZtRNYJIUp/MfTLWQK39Yj4bjGkJqrY+MowCcmBXDAgAH/Af8A81aXKGapMwUAAAAASUVORK5CYII=>

[image77]: <data:image/png;base64,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>

[image78]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAdCAYAAAAzfpVwAAACV0lEQVR4Xu2XPUhcQRSFrxhBUBFRDJJCVwRJFcEfCBgIIRYStFALMTYSQhorG1EsViQQrMSYRkRIIBZiF1IYAgo2QgLa2AgBLcTKBAQri3gOM+ObvbtvceGtTuEHh92585wZZ86981bknoIYgZaheahV9QXFS6jHfq+GdqHt697AeA698dqfoWOvHRwl9rNSzK5yd4OHdriABnVHSNCr62L8Gzzvoaf2Oy0x5/UFRZmYxQ5ZTUNrGU/EUAq9gHagv9B/pZPo0cTolex5VjKeyAH/Q5q7X6Ls/CMmM+mpoBiFxlWMNe8UalbxO8XdHCkV/ykBLvYJdA49UPEj6BdUo+J3Sp8YY2sYS+tggVRAjTqo4PxvJcqVvLhrjklG+JmG2mzb56GYxFtU8QYxhd3nGbSqYj5uLEILfofqo+54WqA9MUl1JNkTO7qhS2hAxTuhKa9NS7FesrrEwbHcSwt3dUmykzyWWjE7VK47PCagM+ixivMY/YUxKen3fMnJsVjTHfz7b5J//oLYEDNBlRfjrnyQzIXxnv8hxmI+TWJObxM6lEw7tUO/xdgjEXJZgJNMqhjbXJTDHfO2bTsL+CfEU90XM14i3MQCRC/2kZhc4N1PaAFdFhNfLHeDgzp4zJ8kO4vfQV8lKkdcAGs53wWYfLQTLVBn+wnHZZKz7icCF+t7cxZ65bUdXNSWRJ7lzh6IOf4u6B/0Ghqz/SRxzxIOxkLeoTs84kqXWzx3nBbgm55rf4SGbfvW4c+ULzoYQ0oKuBSKAXd3QQdzwF2dkQB+eyX+bnBPMbgCP1plv3HZo70AAAAASUVORK5CYII=>

[image79]: <data:image/png;base64,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>

[image80]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAaCAYAAAAaAmTUAAAC1UlEQVR4Xu2XTciMURTHj1C+P2IjyUQW8rVQSpISCwslLBR7FlYWlCxIFrKRrCSzkKRQkrKweMuGrCxEPgoLQihFWfj4/zpzvY8z9z4z82IU86t/77znf+/z3HPn3I8xG/D/MUoaHYMjYGoM9Jux0jHzhErgzZCmRSNwRdocg92wVTonnQra0PJjHK1qeQkGudd8EDmmSEelD9Id6YH0TjrQ8iJzpbvSlmh0YokNJ/RC2iVtkma2/OR9k54FL7FaeiItCvHEG/MkGpXYUvM+9yuxKjvMPRLrmRNS09rLhP9TMrSJjJeuSietvS+skB5aflAN84QWhDiwbm5Jxy3/3CILpbfS8miYxz6a+7SLkASzPj0aYrf5JNQt6NnSV8uvkcXSe2lnNOrgQbw0NyAehHdTmhw8uCedjkExSRoy71vHGPM251ufqzAeJupiiNdC+fDA3NdJ6ZVKDPjW9sSgmCe9NO+7znwtRg6ar1naMClxLaYSx+sKZptZ54EXrH3nYvHi5coA8DbGoA2XZ/L5G4VPOz6XyviIudcVqcT4OnPglUoM0oAiy8y34pTMYWlWEOWZkmGnJBbZZ76muiKVWDMa5l8zXqnEoJQMJUN50L8TtLkhTYyGeTLdPOPHAqPx9uABA8IrlRiUkoE0UXFhV2EMtGHny0Eyn2IwR9qSSwMiVqrlBANJt4UIhyhrji22BAfuI2lONFqQDOPryCXzwVyWJgSPs4HD8Iz5vasEye6PwQr0peYPmR+wCUrqrPTF8rsojJOumZdgkZXSZ/NEqqIz2ygvj17T8i8dMn8hfUuslR6bL3IS50722vy6sqbSLsKB+tR8R+sLlAHnCedKHfw0mG9+t0MNy09OFSaWHZHJ7wusi1fStmj8IiTKVem6/VyefxReyhnCpbDuDtYrTNJzaX00+gE73u0YHCH8jmEd/s7J6RkSKt0UeoFr/19NZMCAf5Xv1BuqJODwCzQAAAAASUVORK5CYII=>

[image81]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHsAAAAaCAYAAACXbyOAAAAFAUlEQVR4Xu2YS8xdUxTHl1BR9UybIkjrMaGkLaIhTDwHysAjmhATAx1IhKRtQtJ8iUgwEGkkEqFiYEAMJAgRg3pEWgQDWiGiGiUiIqREicf6Wd/q3Xd1nXvOub3fvTd6fsk/7bf3uWfvs9faa629RTo6OjraclRsGDELYsNBwCGqQ2PjpLlAtSQ2Bk5QnSTDO8UzsWEIjhCbA+L/0w7GflZ1bOxoyyrVc6ongu5XHad6MOlDK/hxAYb+PLQ5TJZx3lK9KDbe96rdqvnFc004EGMTFe5U7VHtUn2r+lt1dvnQlII9XpUDNPjJqhtVG1T/qDbN/n2xap7qctWtqs9U76rWqK6R/nDKBN4Qm1AEYz4itqgbi3Yc4DrV+6qlRXsdwxibsVarfla9N/u3c4rqL9XNoX3aWKjaqlovI5jn9arvVKfHDrEF+UZ1S+yYZa3YTjktdohFAZyoapI/iUWEuvDvtDU2Djsj5mw4XRZJ2OHMY2XsmDLYaL+ozo8dbSB/bhHb3Rn3ihksy7PsTnbGFbFDzPj8rspJAOfCyXiOj6mjrbF57yeqxbGj4B6x574UqymmGSIvG29ozlL9KLnBKGBeEVuMCDv1abHB2f2RO8Tey/urIB2QAnj/C6Evo42xzxR7L2loENeKPVc317mGzZRtqBIicGaLxrDzeAH5O1LuvMjxYjkXY2VHIgzDbjlDLJyf29/9329o4znfWXU0NTaO+Khqh9TvVq9XJmXsG8Tm+bFqu2qz6iHJizFC+K+xsQ2EBj52m+xfdVMB0ofBI+4ImQE8NSCOOPzLe6KYvC92k4/IxsrAcXeqHgjtGU9Kz9mqHAPHpDCleG0qitysTimhpvhdrID0v1n3nZJvPtbya6l/b4p7ym+xQ3oGYyGyRfPfZrn+MLGwzM4/VfWS6mrpnW8RYZZ38O4qh4o0Nbbn4eWxI2Gv2LNNaoZRskz1g+wfTZh7tqbgNqkL9ynkVT7009ghvVxOJZvl84vEFqpqYrRX5XPHnYI5bOnvSmlqbI8WONUg2CE8V1fEzQUzYmOXFzu+HpcUbSVDG9sLLAbkhiZCpU1flcEG7WzAGaocxSFskq8YZ6a/K6Wpsb2QqTM2u4vTBN86TsrCtMTTTxbC4WjV2zKEsReJ7WgGZIdHPJdTjWfXim5scl4GXsrvH5PqHINRcIgvxMJ9HU2N7XPzMynje8rwe2a/DKq6AyjxkMv3NNXLqiP5cYLvUL69hB39p9jakfNX9Xfvy9lZQTyQh8UmRQiLO5cFIUQzGQySLYZ7J3mZyjyDVMDOZaEuC30nqv5Q3ST5+zOaGhuWiF2WUO1SM3jx9bzqTbGxb5ttmwRcRrmxWe+7xIo1bIJzcbUcK3J3hsZcKFaQRU/EMMeo3kn6UMaM1B9ZeCdRgsW9XawQouLkw9reS7cxNnDFy4Iy1jqx8Qnbj0svxB8uzZ1tlFB5c8Timz4SW6PzVF+pPhDbZBFSJg48EbxIy9JAhFSAoTnXc5FRdcwZRFtjY8SlYuMSyRib8+w5xTP3SZ6mxgVOV+ZgnCDLyX7B9VrsGBfcNRMimUB27zxq2ho7gyPeU2Kpi6PZuI9cw4KDEkUnOt9LxULLlbFjDhiFsTldlOkp5sVphAjFjeDrku/6seI3P/w7l4zC2NQQpJGrZIiqdkJ8KHkOnxgYenVsHDF3x4aDAArIeJLp6Ojo6Ojo+B/xL1ktJafpWdWPAAAAAElFTkSuQmCC>

[image82]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAaCAYAAAC+aNwHAAABRElEQVR4Xu2UTStFURSGX92IrqSUj7oTpXTnYmJuIkkmN0yMpIzFyMTIRD7mDEz8AkkSv0FKTCQDdyDFSD7et7UP+2z7nnMzdZ96arfW2vvsdVrnAP+CTtpHC2Eij136Qh/pHX2nW7TDL4rRRjfoNu3y4mP0iV7TAS+eopee01faFOTELP2kx2FCHMKSm4hvFkV6Aqv7hYIPyLieYx9W2+oHu11wB7WfLtrpGSIHTNA3OuoHI/TQWwQtJH1JrbNYg22+94PJtdRbFnr6FX5e9Dfq+QD5ByzANuuQUpDDMuwWuo3QMK3TwaQANkRy2Iul0Kie0jnYFIopukertOxiNRmnz/SDXtJVeuNi865G7ba4dZRmOkQX6SRdokewlsQIrbh1XczAWtM3oHYuaH+qIgdt0ptPXEH2pEbRtzGNP/xQGtTJFw0UPvBoLjSKAAAAAElFTkSuQmCC>

[image83]: <data:image/png;base64,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>

[image84]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD0AAAAZCAYAAACCXybJAAACZklEQVR4Xu2WPWgVQRSFr6igqKgRFcFgKYpixFLSp9HCShDSpDCgnYVoYSs2KhIIBEE0RcAUFhFBEAwKIWKRFGLhT5EqhYiN2vlzvty5ZjIYeJJd0TAHPt68e2d298zcmV2zqqqqqqqqqqp/TBvEnoJtKbc5i+0Sa1P8v1eY/pF4JHamHKaHxAdbZaZDGMP0J3EoxbrFW3PjpZiEHWJNmWhJ68pAE8JYrHaYPC++iGPRKWmfuCE+i9NFrkltEuPmz3S3yDUiVpdV5gZRzq/EmC2dZVb2jtgrHovjWa4tYbgV0xjDYKx2v/gqevNO5vt8soi1rdZMo41iwtz0d9G3NL2whyk3JuOh2C/WiwtiQDxIbWLvzK9zcWGk2TcxZ35oHkz5c2JY3DY/O0KMvypGxH3xxhZNd4l74pZ4ab7VDov3YlQ8F/PiSOrfkTCK4UnzVS1VrvSg+YmPmDTaxLaYP0CY5jdMI/JPxNYsz7XZPpfEsxRnAphMTFONTBBnDv2u2eL247rEj4pp+0PTsdony0RSbnq7+Wxf/pX1NrHot5xp8vk48rsTrFqMQ1HeB8RH86riOmxB+jKG/2diQNPKTXMjjOQPGOY6MV2OI8ebgjfG70xHDrPlRxPtEzGgaZXlzR6O8ib3NMV43VC+8fCUXiemKdub5iWNKH9KPcp72LwSqUhyV1K7NdPM6pT5ocR+5X8cZMDhFgcZOiVemJcdBw8HG4cS8dfm7/nrCdrEOJQww149a2521vyeTCRwrRnzV2dPGhPXi+f6K4oJKEWMHJ+78U3fqeKLj3GMz8X/VfdZXFW1Qv0Ep9KHJyaecTYAAAAASUVORK5CYII=>

[image85]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAAAZCAYAAACvrQlzAAADGklEQVR4Xu2YS+hNURjFl1CEIu9iIo+EIgwUSSgDFCUDMVLkNaAoZSQjbylCCckjZaAQBodEmTDwGCCRRxFKGJDHWr79dfbZ9L///+XWxV71q333Pt/e3137de4FsrKysrKysrKysrL+CXUi/RO6h7auUV0f0j7UZ7UgN/Rb4CzpHdpk6G7yCtnQNkumydC3ZGSoG0juw0z939XmxSTTfJW6gSvIBzLWH2pSdSSLSLu04Q9oFHlIZqUNtaRVqdUpQ32L3ybHSIfouWbQtORzX3KJdEnq/5QGoA5DZZrM81WqGf9IJsUPNYkWpBWwu6BR0h3TZkOlzuQMzNCvZEa1uaKLZBXZQY6Euu3kC2xlHyaXSQGbYW3HmaFuOVkT6jzmJHkGO240ubfIQrKfXIFpGLkOy+8JWRrq1UcBu0QlrdSDZAksz/lkCnkHO8IWw/LT/TAuxMxFdUzl7KrbUEkmyswCZYKpRqC8uCSdtZoMaR3szJF0tsmoC7BzWPUe94BMCGXFjCZbAzJUz2orq3wK5fmoL/c4lGMVsHz1nCbZn1cfN0NZJin2QPh8KCBp3HhMTWw8Zt2G+iqdnTZE2kS6RZ/Hk4mhLHOKsunHzH8mu8gNMgSWoFba6vCMYnqEskuT4a90G1FObi1DB5EXUb1MOQozyWOVkyQz/ezVLR6PWaA6Zt2GtkZKJF69Wn0+YGqo2rTNFCMTB6P8seB9KCbdDVfJeTKPbEbrDfXxYnm+Huu5qr4IbUNRHdPrpYYbOgbVLR8bovK9UI63vGK0cqaHtjlkaiinhg5HuYrUx2myFmZWL3IHtkO0cv1mL2B9aCXuQbld9S6tM11qydDXqI6peh+z4YZKOuw3kL0oLyVJ5uh81IUgI86RfqFtMuzg30fWwxLfRt6T5ygvGZnyiCwjO8lKWF96lZNRutC2oPyS6kMX2wmYweI47EgpYJeSXrVewi60N6H9U4i7BssnHvMpbEzlfDfEeH4Nkb5YT/y8VX3L6/8A/08glsfVks6yln7upuOmqhX/K9UT03ClZ2jWbyj+RdVUs5z1l+o7/vCmJMc2+bYAAAAASUVORK5CYII=>

[image86]: <data:image/png;base64,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>

[image87]: <data:image/png;base64,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>

[image88]: <data:image/png;base64,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>

[image89]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGIAAAAWCAYAAAA7FknZAAAC3ElEQVR4Xu2XS6jNURSHl1CE5JFHXiWUiKSUASMTyR0woBiYmSvPMJGZgZSUTCSSEAOPJJ0beaSUIlIKiYFkggGF39fa+/z32f7n3lNuBufsr37ds/de99zbWns9tlmhUPg/TJVG5psZ46Th+WZhaMD5+6XL0mNpSetxC3elmflmwWyUtFCanx9kjJVmW/2N3yp9Dp9XSZ+kg9KkpoXZGGmP1JfsFQLHpB/S1aCd9rejp5nf9K9Sw9zhm6Rh4Xy89FC6HdYjpDPm3/1Ieid9CD8JUPy9QgAHfpFWJHvfpV1WOYsSQql5Jc0J+9ukn9LGYEM2EZzTYQ37pC3JGsiUO9lez0OZ4AbjsBSc+VvaHtavw3pD08JLVEP6FdZzpY/WGojDVgWCDDlurQEuBKZLb6Xd2T7lBMefNXfat7Ben9jQU66FfRgt3TRvwkCgLkmLw5rMwZ4MLGQMFoiGuUM7CQTQgLEleNx8MoBMAPrEsvC5kNGuNJEJOPi5NNnqSxPvAG4/+wQFCMBa855z3qrbT+NnoioMACUlbdY4kwCkGcH4ed+qZo1jj5hPQGlG1EEW3Auf+e5D5t9DkMiogcZYAkzWdqIp1gUPxKPmk9J789t/wNzBOCredsbXC8HupbkDzwW7dkRnx8mKfkHQYylcKV00vwx1rDP/fwj4YOq3LnkgcpsoQ9z2ODXlvQM4xzZOTe0Cwe3fK52wqk8wQaW9hr93w7rEgf8Kjl1qrSNlw/zmxomHXsLtnBcNxAzpjfQi2UvhvfDAvGRECGwaCIJ5RVretOhhaK5PrHLYROmZeS+I7DB3IOMoZYSAUOe5zXXjaLv3whrzd0d8n/AIvC5NaFr0MDgSx580L0lkAv0ghaA8NZ+SsKNPnDLPlDravRfIgFvmvSY27rry17NQGqjfm6UF2VmEErba3G5WdpZCvV+UbyZwzhRFUAlIXcAKQ0AnIyQ2XTFuFgqFQpfyB9n5l06ew+imAAAAAElFTkSuQmCC>

[image90]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFkAAAAWCAYAAACrBTAWAAACpElEQVR4Xu2YzatNURiHX6EIKUSK3IyISEJEUQwkBgwo/gADQxFJpDsykZKSiQx8hJR8JCkZICPFxMeAfAwkUQwM8HvuWuvudV9n731GOu2zn3q6Z6219+n2rrXe9a5j1tLSUs0MOdZ3OibJ0b6zpR4Ce0hek0/lopHDw6ySD+UsP9B0JsqFUc9MuVdO9gOOXfJL/LxGfpaHi+EhJshvcovrbzzH5Ud5Tl6SF+SUbHyZ/Cn/xOfeOXdbmIDH8l58Z4w8L0/KD/G59O4JOSo+1xcQjLNyfNZ3X961sLphq4UAl7lczrewipmoxEG5M2sDK3yq62s8m+U617dUfpcbY5tJWF8MD8HknJZnYnuu/GQjgzxoRZB5/pTcVwz3D6st5M4NVmxhcutLOTu298iB+DmxTd60Ik+zE+5YONCAXXDVihzvn+8rCEba9lQFBPa9hRRRxgL5LP7N4TD7YWGyWLGsXFbwgHwilww/2YdQbuU5lnRRxQ15xHdaCC4p5qu8aMWq5TBld/Qt1LavLRxc1K2sZgJNoDqtPFY+KYHLRDfwHXPiZybhWGwzAaSPqlJunIXysRunWw9fbii/VmRt/lHqWAJNKcd2zyGH54dbFSmQCfIzk5dYKa9kbc8m+cb+LRk7+cB69HKTalsfyHkWatoXcpobo2KgNKuDVXvAQgWSoNJg8hJ89+2s3UjYZm99Z4TV6oPMbY3Lxv6srwzq4UcWtnGC9/Igk3quZ+3GQmnFisvz2XYLNS+XjJzFFurnuiCnetjf6qi1f2dtzoFbWbuxEIhf8rk8Gn1l4SrtSbc6LjBVlNXDrFxukhy26RCsm7DGwCm+1kLO3GHlP1MSGMq7/Aru4fDx9XMO41QneNk6T0ZLDd2UUeTpni65WlpaWv4zfwECmICgyMLaywAAAABJRU5ErkJggg==>

[image91]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFkAAAAWCAYAAACrBTAWAAAC4ElEQVR4Xu2YS6hOURTHl1Dk/cijiITySEmIMjORSJkQM5kZ05VMdBMZoKRMJClvJh5JScojJYmhAXkMhChK8vj/7tr7fvts95zP7N6+c37175619/6+7ll77bXW/swaGhqqmSwNzQczRkmD88GG9uDYPdJl6bG0qDjdy0rpnjQtn6gDOGmONDafCAySJlh5pG6VPobnVdIHaW9ruocR0hdpfTbe8XBsd0hfzSPwnXTAio5cKj0L88+lX2HN8DA/Rnoo3Q72EOm0dFR6K702/17+HjbfsFpxwvzlcSScNXfi6mAvkF5JG4KN889Lf6TjYWyeeRSfCjbslrYkNhDhnIZagQNfSBOTse1Sl/nRhm3mDv0hrQhju8JYTA+zpPdWdHK3tZxMZB+Tdram6wPOOmPVx5d0skSaHWzWnjR38s0wRtrgmYIGI6VL0sJgb5SumaeVWjHM/MX3S2ukp+Z5ebNVt1dEP0Xts7QsGaeYfTPfBCKWyCWCZ0qPpMW9K2sEKYJUQUHDIUQjDvopHbJ/O4jx5hGJcx9I84vTPZ9ls5gnr8eoPWfeedSSqeYFLU8X5FJSwUXzSMxh7T7zNReyuRyid0Z4jp/DZgM4RVWtHCeN//F/NMmqT1+/Mc68JaMLSIlFLS+IKXQi383XlREdGSE/E+URiigbWcZa6aV559NOd22AXm5iTsapKdHJRDlRQsFbJ41O1sRTwDq+J4eo7bJWiwd0GummsIE3ErtjwaFcGFKIbJzBxYI27k2wr1jLoURNHO/LyfTD5G2OcSRuXoQO5GpidyzkXDqC5ckYRxQHx8LFxYPOY3qwiVJubTjsSRhLif1w3hZyufmd2Fxgrid2R0MnQK48Ih2U7lsxv9FV4OhP5kXyjrmz+CFoSrIuUtYPE7m3zLuWWATzVNWx8MJzpU3mebOsShPJXK1RjOocNoc+ugzmubAgNq6vzWhoQ9kGpZCnB2zL1dDQ0NAP/AVmro74Kk9YlAAAAABJRU5ErkJggg==>

[image92]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFkAAAAWCAYAAACrBTAWAAACaklEQVR4Xu2YzctNURTGl1CEKN9FpAxEIkWEUiSJCTP+BKUoIknJXEomSjJBiPKVTDDw9QeYMKAQkgyYyMfzs/d29l3v8d4byu3d+6lf56x1Tt17n7323mtfs6qqqsE1VYz0SadxYrhPVnUXxh4Ql8RjsbDz8S+tEPfEDP+gJB0S030yaoKYa+2Vul28j/erxDtxsHn8U2PER7HZ5YsS5n0SS1x+moUKfSOuWDBzhzVTfrx4IG7HeIQ4I46Jl+KFeBWvR8Ww+F6Rohq9yRiIeSwBk2Nui/gidsd4ngXjT8cY7RfbshhR4RNdrhiNFVfFThto8jULhq7Mcogq/R7v54jX1mnyEWtMprKPiz3N47LE1OXHY8JMG2jy85Yc2muNyaPFTQsbGmLQLooFMabyGSxmRZFaas1uz4bnDSX2OZRMHhVjNjPeyweNCp4tHorF8b0iRYWti/d/YjJVizB3g/ggzlpTtecsrPXFapl1bkR/Y3KbqN5Z8Z5BOBxjBoDBHayVY4bwfXphivXp4QZzb7ncvzQ5GZnE+kyVJy0XF7LYa6N4ZqHt68Yd69PDzSbx1Tq/LL0sxr2N8VrrbePzomr3iRNZjk4jf3+SuJHFQ1Jt03G9+ByvxLxDj/zNguG5TtrvTaYfvm9hGif5QWEGXM7iIkT1rbFgMtd0KmMaPhF3rdnMWMupbk5vXnQVdBf+VMcgMVhJHGCuZ/GQV6oyD0sKWiSeikdil4W19ZSF/yK8WIfb+mEqlz2Ao3vaBPncqkyYs1pstXBoaRNVP98nM/GcnhzOW/tgVHVRL20U63TftlxVVVVV/0E/ACC7iyBcCiorAAAAAElFTkSuQmCC>

[image93]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFkAAAAWCAYAAACrBTAWAAACdUlEQVR4Xu2Yy6vNURTHl1DkVcijiGTikZIot8xMJFKGzPwPRDKRgUykZCjdlLc78UgKGSCFZGpAHgMhg3uL8vh+ztr7/vbZnfM7x0Tu+e1Pfbpnr73vObV+6+y99jErFAr1LJRT82DGLDk5DxZ6Q2IPy2vyqVzXPj3OkHwol+QTTWFpHkiYJOdZ90rdKz+H11vkJ3mkmm4xQ36TO7N4IyBxJ+SPfCKwUb40r9BX8qc8LqeH+TnysbwbxlPksDwl38u38kP4e9L8gTWGBeYJGwt/f7dPt1gj38hdYUwVXzJfeybEVplX8bkwhkNyTzIGKpxvQyOZKe9b5yTvM49/l5tD7ECIxe1hhfxo7Uk+ZlWSqezTcn813TzqkkwXsEGuDGO+6mfN194OMbYNXnOgAe93Va4N493yhvm20ljqkpzD9sGh9lVuSuIcZqPmD4GKpXKp4OXyiVw/vrKh9JPkueYVSXIfydXt063kbjOfv2BV1V407zwaTz9JjpDMo+ZrL2dzOVTvsvA6/h9jHgDbR10rN00u7lMO8P/+cvM3SQZaOjqSuvUxkRH2Z6o8wiF6JRnnbJevzdu+Xj6wCXC5qUsyB94OOTuJUT20dayn4nKo2oNWtXhAp5G+/3x5KxkPPHVJfmcev25VQqmaGO+UZPph9m2+xpHY9kX4zJFkPPCwTz43T0J+Zebi8cKqKzdVyq2Ntc/iooTYD+e3uq3yVzLmAnMzGQ8sVBPJ6iRbBNBVkOgv8ry8Z54sfghaFNakdOuH+aw75g8xHoJUdyGBSuZqjd1+SGIboY/uBvNcWJAH1+lhFHrQTxvFPj0hWq5CoVD4R/wBe++DdZE4YWwAAAAASUVORK5CYII=>

[image94]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAVCAYAAADRhGlyAAAB80lEQVR4Xu2Yv0sdQRSFTzCCoEFRIQqCQSxECxUxAY0IgqSKkIRUWog2FtaK/gcWgghpIgQSsFJCggoiEh4qaJsiqRIkTdJFELTzxznMrDszrGipb+eDD9/c2Ve86525lwUikftGKX0cBjMoCwMRYIAe0s90jJb421dU06EwWOw8oDW0hzYGe6KZ/qWTdn1Av9JWmO8KJXSQ/qIPbSwXKGEvkCaigV7QbVppYxv0D6236276AX6i9A/4RvucWC5YpK+QJlAcwSRx3K4L8BPYRb/QCrvWdxfojP2cG8phKs1NjtiFSeAqTJXpr/vMc/rJ7gndearSpGJzg6plnm4hrSZRQHqMlWTdfacwR1dM21jCHn3qrHPPOcwx7nRiT+ga/U87nPgIzHgTsagZnNE34UYGbTDVl9BPf9Bl5PA4C1XSe/oWNzcDHfl1pIlW91XVaj1F3+H6cSYZm3Sn3kb3ermT6AfpR3+HmfmEBuJeZCfhGd2HGXlEE/1HP149Ybr7a2dd1IzCNJI6J/YSfkJcdmCG5gSNNSfwn1ejkblgk7bAPzZLyE6AqjWc99rpMfwEztJhZ1206JhpZMlSVRiimS9sELUwzUOzoF4kyBWYeTFi0V2oxjARbljUgObob/oT/qgTsTzC9W9hEqoQX2dFIpG7zyUz+08+RElp6gAAAABJRU5ErkJggg==>

[image95]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEcAAAAWCAYAAACSYoFNAAACCklEQVR4Xu2XsUsdQRCHRxLBgCGKqAREQYJgFUSiGDRVCkUUtDHgH6CFnZB0YmNrEVBEEEmRIiJaaEgT9KE2ItiZQEA0QQsLBQUtbMzvx87pvvFOr1G44z74eLs79x68ZWZ2TyQj47Eogi/1M4on8LldTDu98AB+g9smFlAAP8IJG0g6JfAtrLYB0ACPYLvOm+EILLt+wo0n4Q6s8tYTzxzchzNwGXbkRUU+w7/iSoo81bVNeAj/wV/wFHbrM6ngGdyC5TpnaZyJy46AnFrsrQ14YzIorpy4camAGzEL35v1HDyG9Tr/Cdclv9H2e2NuWqoyhpSKy5pGs/4FXsEunY+Ka8ZBL2G2+d8ZlhRlTAB7CHtJ1OZ80nmtuJ7Ek4hHdR8s1BibNbMqdbBsWD73bQ6pgxvwBP7QNZYTG3jqSoq8Ftd842yOpUlcxgSltgSnxWUUrwQVuh4Fszaud106H4y4ZRXGd8nPmHPYqmM2+g9eLAwe/3HchZ36nUclqiF/Fbc5vBWHwT9vj21ujv87vAclGv65ebl96cvJ7T/rw5Kyt2D7/JQ3Tiy89q/BF97apbgTyRK8O43bALiAb7y5vSQmlt9wRdzFbkxujmwLM2ZVwpstf2NIxzXwlRdLNDxh3onbnB4TC+CxvQjbbEBpgXtwAf4xsdTDkuLrAz+j4CZXSv47WEZGRgb5DzIbXqZWNPP6AAAAAElFTkSuQmCC>

[image96]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAXCAYAAAC74kmRAAADWklEQVR4Xu2XS6hOURTHl1DklUfkURcpESExkKFEIkVRhsKMgSITBlKYEQZSXhOvpEQp5XpkYqCUiQxuEiGUYuK5ftbZ39ln3b3P/e533bpd91f/vjr7cfb+77XXOp/IAAMEJqkmF79DXVt/ZKLYfhu8UJ1VHVNNjxv6KYdVp+MHN1Qj4wcFQ1Q7Va+cGBx0VDUoDGiSYaqTYnO9US2oNjfFHNUpsTWEdbGPsK7jqpViEU3ba9UP1WoGe3IGsLFlqgeq36onqs2qjYW2q16KRc+IYkwzDFYtV+1VfVdNqDY3BWPWi83xS7VfynVtVd2Tcs3bVJ9VH8WM60TOgMAtscl2+AZlnlgbL+0u68TGdjeCYjjRDtVU95w5T4jNv1T1VdUumX12ZQAOP5f0SQUDUubUwfvaxRbWKkTdXbEo8HB9r4mt7VLxi+FJujKAwYS5PynuF/eNRYxxbTFkXcI+hlAkJAnRVpmpeit2nTxERIfY2jk8+tE/SZ0BuJw64dFiSYjoGOfagPYjqg9iOeSdVBPQFrF5SVatEq4Q5TuGg9pTtFHhyDNcY5JvkjoDcI1N3pQyw9L/m+qCam7ZtcFCsczLxqcVz1apnkp5jdg4C8SIVjkkNgfhHrNP9VP1WOz99KFvljoDcJmFzxb7eEBtqgNizl4vuzbg1Clvs6JnVA8WxFUZKxb62azcBCGHsLm4RH9SPVKtEbt2mMMBrvg7KkPOgPCS3CktEYuEOLSJGBb1XspF7VKNj/qE8K89lS4Ic3S45x7yA8nQR0mFnAEhUeVOiY2ziNiAxWIfHSH0U5BQGZfNyk1wRmwONlcHFSJVJSrkDAguj/INUq2zcRLCgIeSHhOIszJXqvZ0EoQrxLt9co4h6ZH8iAL2t0E1vNKjIGUAGwwn5aFtk1iiQTEzJG0Ad/+gaorYtaF0UmH89eLzdbfU/ynDZL4fmIdrmIMoJBo5IEy4KplK4A1g03Xi85cyQ6lLQYb/orqsOq+6L9VqcUUsAu5I5zLIiZK01rrnwH8G5vXryf2XILIoxbfFkrU/5AbegH8B84Wq4SGCSIrIf1wByTFlQKukPsQq9IYBPeGi5BNvr9DXDDgn3U+MPaIvGdCmWuQf9jbPxD5Y+J3v2vojVCn2+3/zB35eyhiXjyNLAAAAAElFTkSuQmCC>

[image97]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAaCAYAAAAHfFpPAAADa0lEQVR4Xu2YS6iNURTHlzwirzwiiRsDJUpSpLySQiFhoMjEgIERIRMTGSrJxKubgZKUDEQYnBgQ5TFQSuqSUiQRA8lj/ayz7tlnnX3O/T6XHHV+9c+19/etvb+11l5r3yvSoUM7MVg1VjUgTpSAd8fEwf+B0apLqo1xogVdqmWqQckYDtglZq80M1XnVM9VL6t6pDqjOlnVdtUof6EET8XsfVKdDnNwVXVAikd/nOqe2F4nhjlsYK+0E8ar1qv2q76rDqo2JTql+qF66y+UALu3xN7fEebY8F2xjyrKHjFbL1STwhxgb58Ud2gdK1RPxBySgrHjYguX2SyMUFVUn1Xz6qdklmpzGOsLgsA+cvYAex8lP9eSoaor0hglSB0QndMX68Te65b6qExW9ST/LwK2cNorMZtr66d7OSb2zLQ40YrpqteS99x81XvVtziRQCWPZxLYDJvdEsbdMUWZoLojlvakP+9uqHuiBuPMs0ZhVks+wsvFitgH1ZowB0vENoaDrqnOS30Ruq96J1ZoUw6LpWoRyJxDqqOqkarbYnulZuUgiBwR1igMD2OUgueVny7Qo9qmGt77ZA2i/lWsQwysjuGE9Bjx8Tgh7dG0r4tikSzCXDEnT5FaTWGvzT7Qs4TOVgiiw0ZRhEWfiS24MxlfqPoidnSAjc1RXaj+DEQul4r+Eagvtqouq4YlY2fF7FKzcpSx/ws/j0QqwkfgSeZvJuOeMX5voN+fkFomAFGnrriTHI4I7aoSxnO483Oq1B6ro7QDvFDxb4TU58OjAzwKreAsVqSWEU7RDfrZjz2ds8/aXIZyeJ2ohPEsRInIYzBXVWeLFTjmuWo6RRxALfBzSpGdWv3ZHdDsA5zFYtU/Qvtj7WY1xGtAGrCm7BUzRpFJqzeb9HbSLY1FkH7MpYRC6HBOSe0uqRU6smCVmMPSu/tusQIa4QjNEDv3b6Qx+qxHN+JdFOdhkdhc7k7Tixe+eK5ScX9fIPlFYKnqoVjHwNvUgrRYrVTdUD0QK5ApXkQjcU84KiXuEZFdKRwRspbs/euQoqQcV+Sco5jjlhnxQpib6w9+o6Udp8FoS2irfzpK2COLyv6O8U8ga7jd5TLnd8HedWnsPG0Lfwh5LFY4+ws2cp2s7eH3Ddpl2iXKMkR1JA526NChQ46fBJjNqDXhPtEAAAAASUVORK5CYII=>

[image98]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAaCAYAAAAaAmTUAAACyElEQVR4Xu2XTchNURSGX6EISeSjSMlElPKT+mIiisIASTGQAQZKKUwMTL6hEgbykwwkIgM/KdItEzExYCQDElESoZCf923d/X37rnP2ued0TnfiPvXWvWvds/de66y99r5An/+TydRYb6xIE2PUZhR1EtUWMoca42ybqRuwoCqxjjpDnadeU0/bn2WT9lNTYRMeoz5Qb2CL8GgR072xAI37mJro7ErKIeoeKgY0n9pCXaJeUTvb34N+Ut+o9dQg9YtqIbuAedRLZ+vGXuovNeAdsEAfwYJScJU4QZ3zRrKW+kO9oGbDJtdvYzTZcequsxeh4N/CxpvpfIFt1HtqgXcUMZd6Ry3yDrIJNqHeyBrqI+xtxuyDPa9xyrCSegCbTyW7pNM9jJJ0inruHUVshC14infABpNPtb2YekhNivzjqNvUfWpCZC/iFmxOvRGV9oZOdwfbYYkszRBswXmoFLRvNKEW4EssLCivRFNcgXU8JUXJKQpmGfXdG1NoI7eQDWY0rBw+wzqeUNAKKEYlogZx2NlTaN+FPRDmLno2bIFShBLrVpdhUN/FlFU9X5TdgALXm4i52FaK8OZVzl0JJXbNOxwhaE/ZYFRWV2G/9dKxkGq/IRifxAxxie3pdGVI7auywagrXqfGO7tKrIX0YkMwqWCHCaWjDaaNliIErbY8i1oV+VbAus2ByObRrUDltdw7YN3qCfI7qQjBdOUsLKt3kM6M0LmiQFTb6kTxuTANtt9SpaKT/De1G9ZUYlR6W6lP1FLnC6yGPZ9Eh9UXZGs3dU7oXqbz5it1EJ2L1ucLsIAUWIzadTz+ZYxcKnc5n5R3IKsMS3ezsmjRynJe9tUcfsBKrknCgawk9AztiWfUUWevy0LY3Uz3w56yA/YXoilUAbq83kS2A/aEGbD/NHXRfxiVVxNj1eI0rH3X4QhGrlB9+vRpkH+m4ZcbXORJuAAAAABJRU5ErkJggg==>