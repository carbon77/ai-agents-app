def func(a, b):
    return a + b

def test_answer():
    assert func(3, 4) == 7

def test_no():
    assert func(-3, 3) != 0
