/* Complex nested real-world ECL examples */

(<< 404684003 |Clinical finding| : 363698007 |Finding site| = << 39057004 |Pulmonary structure|) AND (<< 64572001 |Disease|)

<< 73211009 |Diabetes mellitus| : 363698007 |Finding site| = << 113331007 |Endocrine system structure|, 246454002 |Occurrence| = << 255407002 |New|

<< 404684003 |Clinical finding| {{ term = "heart" }}

<< 404684003 {{ term = "heart" AND language = en }}

<< 404684003 {{ term match "diabet*" }}

<< 404684003 {{ active = true }}

<< 404684003 {{ dialect = en-US (PREFERRED) }}

<< 404684003 {{ definitionStatusId = DEFINED }}

(<< 404684003 |Clinical finding| : { 363698007 |Finding site| = << 39057004 |Pulmonary structure|, 116676008 |Associated morphology| = << 72704001 |Fracture| }, { 363698007 |Finding site| = << 299701004 |Bone of forearm|, 116676008 |Associated morphology| = << 72704001 |Fracture| }) AND << 372087000 |Primary|

^ 929360071000036103 |Medicine pack simple reference set| : [4..*] << 127489000 |Has active ingredient| = *

<< 125605004 |Fracture of bone| : 363698007 |Finding site| = (<< 272673000 |Bone structure| AND << 299701004 |Bone structure of forearm|)
