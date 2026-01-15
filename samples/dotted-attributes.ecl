/* Dotted attribute examples */

// Simple dotted notation
< 125605004 |Fracture of bone| . 363698007 |Finding site|

// Chained dots
((< 19829001 |Disorder of lung| ) . < 47429007 |Associated with| ) . 363698007 |Finding site|

// Product with active ingredient
< 27658006 |Product containing amoxicillin| . 127489000 |Has active ingredient|

// With constraint operators
< 125605004 . << 363698007

// Multiple chained attributes
<< 19829001 . < 47429007 . 363698007
