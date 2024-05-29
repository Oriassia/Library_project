
      showHistory(1);
      let nextPageHistory;
      let previousPageHistory;

      async function showHistory(page) {
        try {
          const response = await axios.get(
            `http://localhost:8001/history?_page=${page}`
          );

          const historyData = response.data.data.reverse();
          nextPageHistory = response.data.next;
          previousPageHistory = response.data.prev;

          let historyTableElem = document.querySelector(".history-table");

          // Clear existing rows in case the function is called multiple times
          historyTableElem.innerHTML = `<tr>
            <th>Place</th>
            <th>Image</th>
            <th>Name</th>
            <th>ISBN</th>
            <th>Action</th>
            <th>Date & Time</th>
          </tr>`;

          for (const obj of historyData) {
            historyTableElem.innerHTML += `<tr>
                        <td>${historyData.indexOf(obj) + 1}</td>
                        <td><img src="${obj.image}" alt=""></td>
                        <td>${obj.bookName}</td>
                        <td>${obj.ISBN}</td>
                        <td>${obj.action}</td>
                        <td>${obj.date}</td>
                    </tr>`;
          }

          document.querySelector(".history-content").style.display = "block";
        } catch (error) {
          console.error("Error fetching history data:", error);
        }
      }
      console.log(nextPageHistory);

      // Example function to demonstrate button functionality
      async function fetchMultiplePages() {
        console.log("fetchMultiplePages called");
      }
      function nextPageHistoryTable() {
        if (nextPageHistory !== null) showHistory(nextPageHistory);
      }

      function previousPageHistoryTable() {
        if (previousPageHistory !== null) showHistory(previousPageHistory);
      }
    