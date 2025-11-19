import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToDoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export const WeeklyToDo = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [todos, setTodos] = useState<ToDoItem[]>(() => {
    const stored = localStorage.getItem("weeklyToDos");
    return stored ? JSON.parse(stored) : [];
  });
  const [newTodoText, setNewTodoText] = useState("");

  const saveTodos = (updatedTodos: ToDoItem[]) => {
    setTodos(updatedTodos);
    localStorage.setItem("weeklyToDos", JSON.stringify(updatedTodos));
  };

  const addTodo = () => {
    if (!newTodoText.trim()) return;

    const newTodo: ToDoItem = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    saveTodos([...todos, newTodo]);
    setNewTodoText("");
  };

  const toggleTodo = (id: string) => {
    saveTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    saveTodos(todos.filter((todo) => todo.id !== id));
  };

  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;

  return (
    <Card className="mx-6 mt-6 mb-6 rounded-3xl border-border/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <span className="text-xl">✓</span>
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold">Weekly To-Do</h3>
            <p className="text-xs text-muted-foreground">
              {totalCount === 0
                ? "Set your weekly goals"
                : `${completedCount} of ${totalCount} completed`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalCount > 0 && (
            <div className="text-xs font-medium text-muted-foreground">
              {Math.round((completedCount / totalCount) * 100)}%
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-border/60">
          <div className="pt-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Track your weekly health goals to support your long-term diabetes management
            </p>
          </div>

          {/* Add new todo */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a new goal..."
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addTodo();
                }
              }}
              className="flex-1 h-9"
            />
            <Button
              size="sm"
              onClick={addTodo}
              disabled={!newTodoText.trim()}
              className="h-9"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Todo list */}
          {todos.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground border-2 border-dashed border-border/60 rounded-2xl">
              No goals yet. Add your first weekly goal above!
            </div>
          ) : (
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-background/80 transition-opacity",
                    todo.completed && "opacity-60"
                  )}
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm leading-relaxed break-words",
                        todo.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {todo.text}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTodo(todo.id)}
                    className="h-6 w-6 p-0 flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Progress summary */}
          {totalCount > 0 && (
            <div className="pt-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${(completedCount / totalCount) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
