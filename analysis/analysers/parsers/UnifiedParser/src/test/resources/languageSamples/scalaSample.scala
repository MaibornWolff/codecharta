package com.example.sample

import scala.util.{Try, Success, Failure}
import scala.concurrent.Future

// Single-line comment
/* Multi-line comment
   spanning multiple lines */

/** Scaladoc comment
  * for documentation
  */
object TaskManager {

  // Simple function with parameters
  def calculatePriority(urgency: Int, importance: Int): Int = {
    urgency * importance
  }

  // Function with if-else control flow
  def isHighPriority(priority: Int): Boolean = {
    if (priority > 50) {
      true
    } else {
      false
    }
  }

  // Pattern matching with multiple cases
  def getPriorityLabel(priority: Int): String = priority match {
    case p if p < 20 => "Low"
    case p if p < 50 => "Medium"
    case p if p < 80 => "High"
    case _ => "Critical"
  }

  // Function with logical operators
  def isValidTask(name: String, priority: Int): Boolean = {
    name.nonEmpty && priority >= 0 && priority <= 100 || name == "urgent"
  }

  // For comprehension
  def processTaskIds(ids: List[Int]): List[Int] = {
    for {
      id <- ids
      if id > 0
      doubled = id * 2
    } yield doubled
  }

  // While loop
  def countDown(n: Int): Unit = {
    var counter = n
    while (counter > 0) {
      println(counter)
      counter -= 1
    }
  }

  // Do-while loop
  def repeatUntilZero(start: Int): Int = {
    var value = start
    do {
      value -= 1
    } while (value > 0)
    value
  }

  // Try-catch-finally
  def safeDivide(a: Int, b: Int): Try[Int] = {
    try {
      Success(a / b)
    } catch {
      case e: ArithmeticException => Failure(e)
      case e: Exception => Failure(e)
    } finally {
      println("Division attempted")
    }
  }

  // Lambda expression
  val doubleValue: Int => Int = (x: Int) => x * 2

  // Anonymous function
  val addNumbers = (a: Int, b: Int) => a + b

  // Partial function
  val divide: PartialFunction[(Int, Int), Int] = {
    case (a, b) if b != 0 => a / b
  }
}

// Case class
case class Task(id: Int, name: String, priority: Int)

// Trait with method
trait TaskProcessor {
  def process(task: Task): Unit = {
    if (task.priority > 50) {
      println(s"Processing high priority task: ${task.name}")
    }
  }
}

// Class with constructor parameters
class TaskHandler(val maxTasks: Int, val timeout: Int) extends TaskProcessor {

  private var taskCount = 0

  // Method with implicit parameter
  def addTask(task: Task)(implicit logger: String => Unit): Boolean = {
    if (taskCount < maxTasks) {
      taskCount += 1
      logger(s"Task added: ${task.name}")
      true
    } else {
      false
    }
  }

  // Method with Option
  def getTaskById(id: Int, tasks: List[Task]): Option[Task] = {
    tasks.find(_.id == id)
  }

  // Higher-order function
  def filterTasks(tasks: List[Task], predicate: Task => Boolean): List[Task] = {
    tasks.filter(predicate)
  }

  // Nested function
  def complexOperation(x: Int): Int = {
    def innerCalculation(y: Int): Int = {
      if (y > 0) {
        y * 2
      } else {
        0
      }
    }
    innerCalculation(x) + 10
  }
}

// Companion object
object TaskHandler {
  def apply(maxTasks: Int): TaskHandler = new TaskHandler(maxTasks, 5000)
}
