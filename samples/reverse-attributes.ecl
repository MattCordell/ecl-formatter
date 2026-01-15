/* Reverse attribute examples */

// Brief syntax with R
< 91723000 |Anatomical structure| : R 363698007 |Finding site| = < 125605004 |Fracture of bone|

// Long syntax with reverseOf
descendantOf 91723000 |Anatomical structure| : reverseOf 363698007 |Finding site| = descendantOf 125605004 |Fracture of bone|

// With cardinality
<< 404684003 : [1..*] R 363698007 = << 39057004

// Multiple reverse attributes
<< 404684003 : R 363698007 = << 39057004, R 116676008 = << 55641003

// Lowercase r (normalized to uppercase R)
< 91723000 : r 363698007 = < 125605004
