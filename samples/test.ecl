/* Simple concept reference */
404684003 |Clinical finding|

/* Constraint operators - brief syntax */
< 404684003 |Clinical finding|
<< 73211009 |Diabetes mellitus|
<! 404684003 |Clinical finding|
<<! 404684003 |Clinical finding|
> 40541001 |Acute pulmonary edema|
>> 40541001 |Acute pulmonary edema|
>! 40541001 |Acute pulmonary edema|
>>! 40541001 |Acute pulmonary edema|
^ 700043003 |Example problem list concepts reference set|

/* Constraint operators - long syntax */
descendantOf 404684003 |Clinical finding|
descendantOrSelfOf 73211009 |Diabetes mellitus|
childOf 404684003 |Clinical finding|
ancestorOf 40541001 |Acute pulmonary edema|
memberOf 700043003 |Example problem list concepts reference set|

/* Wildcard */
*
<< *

/* Logical operators */
<< 19829001 |Disorder of lung| AND << 301867009 |Edema of trunk|
<< 19829001 |Disorder of lung| OR << 301867009 |Edema of trunk|
<< 19829001 |Disorder of lung| MINUS << 301867009 |Edema of trunk|

/* Refinement */
<< 404684003 |Clinical finding|: 363698007 |Finding site| = << 39057004 |Pulmonary valve|

/* Attribute group */
<< 404684003 |Clinical finding|: { 363698007 |Finding site| = << 39057004 |Pulmonary valve| }

/* Multiple attributes */
<< 404684003 |Clinical finding|:
    363698007 |Finding site| = << 39057004 |Pulmonary valve|,
    116676008 |Associated morphology| = << 55641003 |Infarct|

/* Cardinality */
<< 404684003 |Clinical finding|: [1..3] 363698007 |Finding site| = << 39057004 |Pulmonary valve|
<< 404684003 |Clinical finding|: [0..*] 363698007 |Finding site| = *

/* Nested expression */
(<< 404684003 |Clinical finding|: 363698007 |Finding site| = << 39057004 |Pulmonary valve|)
    AND (<< 64572001 |Disease|)

/* Description filter */
<< 404684003 |Clinical finding| {{ term = "heart" }}
<< 404684003 |Clinical finding| {{ term = match:"heart*" }}
<< 404684003 |Clinical finding| {{ dialect = en-US }}
<< 404684003 |Clinical finding| {{ type = PREFERRED }}

/* Concept filter */
<< 404684003 |Clinical finding| {{ definitionStatusId = PRIMITIVE }}
<< 404684003 |Clinical finding| {{ active = true }}

/* Alternate identifier */
LOINC#54486-6
LOINC#"54486-6"

/* Complex example */
(<< 404684003 |Clinical finding|:
    { 363698007 |Finding site| = << 39057004 |Pulmonary valve|,
      116676008 |Associated morphology| = << 55641003 |Infarct| }
) {{ term = "heart", dialect = en-US }}
