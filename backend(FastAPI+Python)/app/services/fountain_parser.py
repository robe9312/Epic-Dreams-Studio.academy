import re
from typing import List, Dict, Any

class FountainParser:
    """
    A simple Python parser for the Fountain screenwriting format.
    Focuses on Scene Headings, Action, Characters, and Dialogue.
    """
    
    def __init__(self):
        self.scene_heading_re = re.compile(r'^(INT\.|EXT\.|EST\.|INT/EXT\.|I/E\.)', re.IGNORECASE)
        self.transition_re = re.compile(r'^([A-Z ]+TO:)$')
        self.character_re = re.compile(r'^([A-Z0-9 ]+)$')
        
    def parse(self, text: str) -> List[Dict[str, Any]]:
        lines = text.split('\n')
        scenes = []
        current_scene = None
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
            
            # 1. Check for Scene Heading
            if self.scene_heading_re.match(line):
                if current_scene:
                    scenes.append(current_scene)
                current_scene = {
                    "type": "scene",
                    "heading": line,
                    "content": [],
                    "metadata": {}
                }
                continue
            
            if not current_scene:
                # If there's content before the first scene heading, create a default scene
                current_scene = {"type": "scene", "heading": "PROLOGUE", "content": [], "metadata": {}}
            
            # 2. Check for Transition
            if self.transition_re.match(line):
                current_scene["content"].append({"type": "transition", "text": line})
                continue
            
            # 3. Check for Character (ALL CAPS, not a transition or scene heading)
            # A character line must be followed by dialogue (next non-empty line)
            if self.character_re.match(line) and i + 1 < len(lines):
                next_line = lines[i+1].strip()
                if next_line and not self.scene_heading_re.match(next_line):
                    current_scene["content"].append({
                        "type": "dialogue",
                        "character": line,
                        "text": next_line
                    })
                    # Skip the next line as we consumed it
                    lines[i+1] = "" 
                    continue
            
            # 4. Action (default)
            current_scene["content"].append({"type": "action", "text": line})
            
        if current_scene:
            scenes.append(current_scene)
            
        return scenes

# Global instance for shared use
parser = FountainParser()
