# tests/unit/test_edit.py
import pytest
from app.routes.edit import update_nested_dict

def test_update_nested_dict_simple():
    """Test con un diccionario simple"""
    original = {"name": "John", "age": 30}
    updates = {"name": "Jane"}
    result = update_nested_dict(original, updates)
    
    assert result["name"] == "Jane"
    assert result["age"] == 30
    assert len(result) == 2

def test_update_nested_dict_nested():
    """Test con diccionarios anidados"""
    original = {
        "basics": {
            "name": "John",
            "email": "john@example.com",
            "location": {
                "city": "San Francisco",
                "country": "USA"
            }
        }
    }
    
    updates = {
        "basics": {
            "name": "Jane",
            "location": {
                "city": "New York"
            }
        }
    }
    
    result = update_nested_dict(original, updates)
    
    assert result["basics"]["name"] == "Jane"
    assert result["basics"]["email"] == "john@example.com"
    assert result["basics"]["location"]["city"] == "New York"
    assert result["basics"]["location"]["country"] == "USA"

def test_update_nested_dict_with_arrays():
    """Test con arrays dentro del diccionario"""
    original = {
        "skills": [
            {"name": "Python", "level": "Advanced"},
            {"name": "JavaScript", "level": "Intermediate"}
        ]
    }
    
    updates = {
        "skills": [
            {"name": "Python", "level": "Expert"},
            {"name": "JavaScript", "level": "Intermediate"},
            {"name": "React", "level": "Beginner"}
        ]
    }
    
    result = update_nested_dict(original, updates)
    assert result["skills"] == updates["skills"]
    assert len(result["skills"]) == 3

def test_update_nested_dict_new_fields():
    """Test añadiendo nuevos campos"""
    original = {"name": "John"}
    updates = {"email": "john@example.com"}
    
    result = update_nested_dict(original, updates)
    assert result["name"] == "John"
    assert result["email"] == "john@example.com"
    assert len(result) == 2

def test_update_nested_dict_empty():
    """Test con un diccionario vacío"""
    original = {}
    updates = {"name": "John"}
    
    result = update_nested_dict(original, updates)
    assert result["name"] == "John"
    assert len(result) == 1
    
    # Caso inverso
    original = {"name": "John"}
    updates = {}
    
    result = update_nested_dict(original, updates)
    assert result["name"] == "John"
    assert len(result) == 1