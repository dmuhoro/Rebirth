import { TheologicalTheme } from "../types";

/**
 * Formation Journeys (Phase 3.5 content).
 *
 * Fixed template per docs/THEOLOGY.md:
 *   the gap · the call · the objection · the formation · the obedience ·
 *   the failure · the fruit · the practice · a Christ connection
 *
 * These walks a biblical figure through the same gap the user names — keeping
 * the intent of "closing the gap between where I am and where I want to be"
 * while dropping the law-of-attraction claim that inner vibration attracts
 * outcomes. Transformation is received from God, not manufactured.
 *
 * Presented as an interpretive pattern readers observe, not doctrine.
 */

export interface FormationJourney {
  id: string;
  figure: string;
  theme: TheologicalTheme;
  themeLabel: string;
  // The fixed template sections
  theGap: string; // where the person starts — the tension they feel
  theCall: string; // God's initiative toward them
  theObjection: string; // honest weakness / objection raised
  theFormation: string; // hidden or painful season God uses as classroom
  theObedience: string; // specific, often costly or counterintuitive action
  theFailure: string; // failure and restoration (metanoia)
  theFruit: string; // outcome that served God's purposes beyond them
  thePractice: string; // one concrete practice for the user
  christConnection: string; // how this points to Christ
  scriptureReference: string;
  scriptureText: string;
  audioNarrationText: string;
  estimatedMinutes: number;
}

export const FORMATION_JOURNEYS: FormationJourney[] = [
  {
    id: "journey-joseph",
    figure: "Joseph",
    theme: "spiritual_strength",
    themeLabel: "Waiting & Abiding",
    theGap:
      "You feel overlooked, delayed, or stuck in a season that makes no sense — the promise seems far off and the pit feels permanent.",
    theCall:
      "God gave Joseph dreams of leadership long before the palace, but the path to them ran through betrayal, slavery, and prison.",
    theObjection:
      "Joseph never voiced a polished objection — his life itself was the protest: a coat stripped, a cistern dark, a prison cell cold.",
    theFormation:
      "The pit and the prison were God's classroom. Joseph learned to steward responsibility in obscurity before he could steward a nation in power.",
    theObedience:
      "Joseph interpreted dreams faithfully in prison, asked only to be remembered, and when elevated, stored grain not for Egypt's glory but for the survival of many.",
    theFailure:
      "Joseph's brothers meant harm, yet Joseph saw God's hand: 'You meant evil against me, but God meant it for good' (Genesis 50:20).",
    theFruit:
      "Joseph's obedience preserved Israel and the surrounding nations through famine — the outcome served God's purposes far beyond Joseph himself.",
    thePractice:
      "Name one responsibility you can steward faithfully today, even in obscurity. Do it as unto the Lord, not for visible reward.",
    christConnection:
      "Joseph — the rejected brother who became the savior of many — points to Christ, rejected by His own yet becoming the salvation of the world.",
    scriptureReference: "Genesis 50:20",
    scriptureText:
      "As for you, you meant evil against me, but God meant it for good, to bring it about that many people should be kept alive, as they are today.",
    audioNarrationText:
      "Joseph's life teaches us that waiting is not wasted. The pit, the prison, the forgotten years — God used each as a classroom. When you feel delayed, remember: the same God who formed Joseph in obscurity is forming you. Your season is not a setback; it is preparation. Surrender the timeline to Him, and steward faithfully where you are.",
    estimatedMinutes: 6,
  },
  {
    id: "journey-moses",
    figure: "Moses",
    theme: "repentance_transformation",
    themeLabel: "Clean Heart & Calling",
    theGap:
      "You feel inadequate for what God is asking. You look at your past failures, your speech, your limitations, and wonder how God could use you.",
    theCall:
      "God called Moses from the burning bush: 'I have seen the affliction of my people... Come, I will send you to Pharaoh.'",
    theObjection:
      "'Who am I that I should go to Pharaoh?' and 'I am slow of speech and of tongue.' Moses argued with God five times before obeying.",
    theFormation:
      "Forty years in Midian, tending sheep — a hidden season that broke Moses's self-reliance and taught him dependence on God.",
    theObedience:
      "Moses returned to Egypt, confronted Pharaoh, and led Israel through the Red Sea — not because he was confident, but because God was faithful.",
    theFailure:
      "Moses struck the rock in anger instead of speaking to it, and was barred from entering the Promised Land. Yet God buried him and used him mightily.",
    theFruit:
      "Israel was delivered from bondage, received the Law, and became a nation — all through a man who once said, 'Who am I?'",
    thePractice:
      "Write down your 'who am I?' objection. Then pray Exodus 4:12: 'I will be with your mouth and teach you what you shall speak.'",
    christConnection:
      "Moses — the deliverer who could not enter the promised land himself — points to Christ, the greater Deliverer who perfectly obeys and leads us in.",
    scriptureReference: "Exodus 4:11-12",
    scriptureText:
      "The LORD said to him, 'Who has made man's mouth?... Go, and I will be with your mouth and teach you what you shall speak.'",
    audioNarrationText:
      "Moses was a murderer, a fugitive, a man with a speech impediment — and God chose him. Your limitations do not disqualify you from God's call. The burning bush did not burn Moses; it revealed that God's presence is sufficient. When you feel inadequate, remember: God does not call the equipped; He equips the called. Surrender your 'who am I?' to the 'I AM WHO I AM.'",
    estimatedMinutes: 7,
  },
  {
    id: "journey-david",
    figure: "David",
    theme: "repentance_transformation",
    themeLabel: "Failure & Restoration",
    theGap:
      "You have failed — morally, relationally, spiritually — and wonder if restoration is possible or if you're permanently disqualified.",
    theCall:
      "David was called from the shepherd's field to be Israel's king, a man after God's own heart.",
    theObjection:
      "David did not object to his calling, but he objected to God's timing — he waited years as a fugitive while Saul hunted him.",
    theFormation:
      "The caves of Adullam and the wilderness of Ziph formed David's psalms — lament, trust, and repentance poured out before God.",
    theObedience:
      "David refused to stretch out his hand against Saul, 'the LORD's anointed,' choosing mercy over revenge even when he had the advantage.",
    theFailure:
      "David's sin with Bathsheba and the murder of Uriah — confronted by Nathan, David confessed, 'I have sinned against the LORD,' and was restored (Psalm 51).",
    theFruit:
      "From David's restored line came Christ. His repentance became the pattern for every broken heart that returns to God.",
    thePractice:
      "Pray Psalm 51:10: 'Create in me a clean heart, O God.' Confess specifically, receive forgiveness specifically, and walk forward in grace.",
    christConnection:
      "David — the shepherd-king who failed yet was restored — points to Christ, the greater Son of David whose kingdom never fails and whose mercy never ends.",
    scriptureReference: "Psalm 51:10-12",
    scriptureText:
      "Create in me a clean heart, O God, and renew a right spirit within me. Cast me not away from your presence, and take not your Holy Spirit from me.",
    audioNarrationText:
      "David knew both the cave and the crown, the psalm and the failure. His life teaches us that repentance is not the end of usefulness — it is the beginning of restoration. When you have failed, do not hide. Come to the Lord as David did: honestly, brokenly, trustingly. The same God who restored David restores you. Your story is not over.",
    estimatedMinutes: 7,
  },
  {
    id: "journey-nehemiah",
    figure: "Nehemiah",
    theme: "spiritual_strength",
    themeLabel: "Rebuilding Under Pressure",
    theGap:
      "You face a broken situation — a relationship, a ministry, a dream — and feel the weight of rebuilding something that lies in ruins.",
    theCall:
      "Nehemiah heard that Jerusalem's walls were broken down and responded: 'Let us rise up and build.'",
    theObjection:
      "Nehemiah had no objection to the work, but he faced relentless opposition: mockery, threats, conspiracy, and fear.",
    theFormation:
      "Nehemiah fasted and prayed for days before speaking to the king — a hidden season of dependence before any brick was laid.",
    theObedience:
      "Nehemiah surveyed the walls at night, organized the people, armed them with tools and swords, and rebuilt in fifty-two days.",
    theFailure:
      "Nehemiah confronted corruption and backsliding after the wall was finished — restoration required ongoing vigilance, not just a one-time build.",
    theFruit:
      "Jerusalem's walls were restored, the people were regathered, and God's name was vindicated among the nations.",
    thePractice:
      "Identify one 'broken wall' in your life. Spend five minutes in prayer before taking one concrete step to rebuild it.",
    christConnection:
      "Nehemiah — the cupbearer who rebuilt God's city — points to Christ, who rebuilds the broken temple of our hearts and makes us living stones.",
    scriptureReference: "Nehemiah 2:17-18",
    scriptureText:
      "Then I said to them, 'You see the trouble we are in, how Jerusalem lies in ruins with its gates burned. Come, let us build the wall of Jerusalem, that we may no longer suffer derision.'",
    audioNarrationText:
      "Nehemiah wept before he worked. He prayed before he planned. Rebuilding is not primarily about bricks — it is about dependence on God. When you face a broken situation, start where Nehemiah started: on your knees. Then rise and build, one stone at a time, trusting that the same God who strengthened Nehemiah strengthens you.",
    estimatedMinutes: 6,
  },
  {
    id: "journey-ruth",
    figure: "Ruth",
    theme: "spiritual_strength",
    themeLabel: "Loss & Loyalty",
    theGap:
      "You are grieving — a loss, a departure, a future that looks nothing like you expected — and wonder if hope is still possible.",
    theCall:
      "Ruth, a Moabite widow, chose to cling to her mother-in-law Naomi: 'Where you go I will go, and your people my people.'",
    theObjection:
      "Ruth had no voice of objection, but she faced bitterness — Naomi called herself 'Mara,' bitter, because the Almighty had dealt bitterly with her.",
    theFormation:
      "The fields of Boaz — gleaning, humility, and faithfulness in small things — formed Ruth's character before her redemption.",
    theObedience:
      "Ruth followed Naomi to Bethlehem, worked faithfully in the fields, and trusted God's provision through Boaz.",
    theFailure:
      "Ruth's story has no moral failure — instead, it shows how God honors steadfast love and faithfulness in ordinary obedience.",
    theFruit:
      "Ruth became the great-grandmother of David — and thus an ancestor of Christ. Her faithfulness in a small field became part of redemption history.",
    thePractice:
      "Choose one act of steadfast love today — for someone who cannot repay you. Do it as Ruth did, trusting God sees and honors it.",
    christConnection:
      "Ruth — the foreigner brought into God's covenant people — points to Christ, who welcomes the outsider and redeems the seemingly lost.",
    scriptureReference: "Ruth 1:16-17",
    scriptureText:
      "Where you go I will go, and where you lodge I will lodge. Your people shall be my people, and your God my God.",
    audioNarrationText:
      "Ruth's story begins in loss — a widow, a foreigner, with nothing. Yet her steadfast love and faithful obedience positioned her at the center of God's redemptive plan. Grief does not disqualify you from God's purpose. When you feel empty, remember: God often fills empty hands with fullness beyond what you could imagine. Cling to Him as Ruth clung to Naomi.",
    estimatedMinutes: 6,
  },
  {
    id: "journey-paul",
    figure: "Paul",
    theme: "divinity_of_christ",
    themeLabel: "From Achievement to Christ",
    theGap:
      "You are relying on your own achievements, credentials, or religious performance — and sense that something more is required.",
    theCall:
      "Paul, a Pharisee of Pharisees, was stopped on the road to Damascus by the risen Christ: 'Saul, Saul, why do you persecute me?'",
    theObjection:
      "Paul did not object — he was violently opposed to Christ until Christ intervened. His objection was to the gospel itself, until grace conquered him.",
    theFormation:
      "Three years in Arabia, then years of obscurity in Tarsus and Antioch — God formed Paul's theology before he became the apostle to the Gentiles.",
    theObedience:
      "Paul preached Christ crucified across the Roman world, suffered beatings, shipwreck, imprisonment, and ultimately martyrdom.",
    theFailure:
      "Paul persecuted the church before his conversion — the chief of sinners, by his own account. Yet grace overwhelmed his sin.",
    theFruit:
      "The gospel spread to the Gentiles, the New Testament was written in part through Paul, and countless believers have been strengthened by his letters.",
    thePractice:
      "Count your achievements as loss for the sake of Christ (Philippians 3:7-8). Identify one thing you are trusting in besides Christ, and lay it down.",
    christConnection:
      "Paul — the persecutor transformed by the risen Christ — points to Christ himself, who is not merely the best example but the Savior who lays down His life for His enemies.",
    scriptureReference: "Philippians 3:7-8",
    scriptureText:
      "But whatever gain I had, I counted as loss for the sake of Christ. Indeed, I count everything as loss because of the surpassing worth of knowing Christ Jesus my Lord.",
    audioNarrationText:
      "Paul had everything the world values — education, status, zeal — and counted it all as rubbish compared to knowing Christ. Your achievements cannot save you, and your failures cannot disqualify you. Christ is the center. When you are tempted to trust in your own performance, remember: knowing Christ is the surpassing worth. Lay it down, and take up the life of faith in the Son of God who loved you and gave Himself for you.",
    estimatedMinutes: 7,
  },
  {
    id: "journey-christ",
    figure: "Jesus Christ",
    theme: "divinity_of_christ",
    themeLabel: "The Eternal Logos",
    theGap:
      "You long for a Bridge between your brokenness and God's holiness — someone who perfectly represents both God and man.",
    theCall:
      "The Father sent the Son: 'This is my beloved Son, with whom I am well pleased.' The eternal Logos became flesh.",
    theObjection:
      "Christ faced temptation in the wilderness and agony in Gethsemane — 'Let this cup pass from me' — yet submitted: 'Not my will, but yours.'",
    theFormation:
      "Christ was formed through obedience — 'Although he was a son, he learned obedience through what he suffered' (Hebrews 5:8).",
    theObedience:
      "Christ obeyed perfectly — living sinlessly, dying sacrificially, rising victoriously — the only Bridge between fallen humanity and the Holy God.",
    theFailure:
      "Christ knew no failure, no sin, no weakness of faith. He was abandoned on the cross so that we would never be abandoned.",
    theFruit:
      "Salvation, reconciliation, eternal life — the outcome that serves God's purposes for all who believe, for eternity.",
    thePractice:
      "Abide in Christ the Vine (John 15:5). Apart from Him you can do nothing; in Him you bear much fruit. Begin each day by surrendering to His lordship.",
    christConnection:
      "Christ is not merely the final case study. He is the fulfillment of every prior pattern — the perfect Son who hears, obeys, and accomplishes the Father's will. Every journey leads to Him.",
    scriptureReference: "Colossians 1:15-17",
    scriptureText:
      "He is the image of the invisible God, the firstborn of all creation. For by him all things were created... and in him all things hold together.",
    audioNarrationText:
      "Christ is the center of every story, the fulfillment of every promise, the Bridge between heaven and earth. He perfectly heard the Father, perfectly obeyed, and perfectly accomplished redemption. When you look at every biblical figure, remember: they point to Him. When you feel the gap between where you are and where you want to be, remember: Christ has already crossed it for you. Abide in Him. He holds all things together.",
    estimatedMinutes: 8,
  },
];
