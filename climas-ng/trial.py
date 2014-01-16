
from climasng.parsing.prosemaker import ProseMaker
from climasng.parsing.conditionparser import ConditionParser

pm = ProseMaker()

cp = ConditionParser()

cp.condition = "12 =3= 10"
print cp.result